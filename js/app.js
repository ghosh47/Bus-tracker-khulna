import { APP_CONFIG, DEFAULT_STOPS, ROUTE_COORDINATES } from './config.js';
import { Bus } from './models/Bus.js';
import { BusStop } from './models/BusStop.js';
import { Driver } from './models/Driver.js';
import { Student } from './models/Student.js';
import { MapService } from './services/MapService.js';
import { LocationService } from './services/LocationService.js';
import { AuthService } from './services/AuthService.js';
import { TrackingService } from './services/TrackingService.js';
import { ETAService } from './services/ETAService.js';

// Global singletons for active session
let mapService = null;
let campusBus = null;
let currentStudent = null;
let etaService = null;
let stopsList = [];
let simulationInterval = null;
let currentWaypointIndex = 0;
let locationService = null;
let trackingService = null;
let activeDriver = null;
let packetsTransmitted = 0;
let authService = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log(`[BOOT] ${APP_CONFIG.appName} v${APP_CONFIG.version} initialized.`);

    // 1. Initialize Auth and Tracking if Firebase SDK is loaded
    if (typeof firebase !== 'undefined') {
        try {
            authService = new AuthService();
            trackingService = new TrackingService();
            setupGlobalAuthHandlers();
            console.log('[FIREBASE] Services initialized successfully.');
        } catch (e) {
            console.warn('[FIREBASE NOTICE] Check config.js keys.', e);
        }
    }

    // 2. Student Tracking Page
    if (document.getElementById('map')) {
        initStudentMapPage();
        setupSimulationControls();
        setupLiveTrackingSubscription(); // <-- Subscribes student map to Firebase
    }

    // 3. Driver Dashboard Page
    if (document.getElementById('start-trip-btn')) {
        initDriverDashboard();
    }

    // 4. Login Page
    if (document.getElementById('login-form')) {
        initLoginPage();
    }
});

/* =========================================================
   STUDENT PAGE CONTROLLERS (Milestones 4, 5, 8 & 9)
   ========================================================= */
function populateStopDropdown(stops) {
    const select = document.getElementById('stop-selector');
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose your pickup stop --</option>';

    stops.forEach((stop, index) => {
        const option = document.createElement('option');
        option.value = stop.stopId;
        const displayName = typeof stop.getStopName === 'function' ? stop.getStopName() : stop.stopName;
        option.textContent = `${index + 1}. ${displayName}`;
        select.appendChild(option);
    });
}

function initStudentMapPage() {
    const initialCoords = ROUTE_COORDINATES[0];
    campusBus = new Bus('bus-01', 'BAUST Khulna Shuttle', initialCoords[0], initialCoords[1]);
    currentStudent = new Student('stu-001', 'Khulna Student');
    etaService = new ETAService(APP_CONFIG.averageSpeedKmH);

    stopsList = DEFAULT_STOPS.map(
        s => new BusStop(s.id, s.name, s.latitude, s.longitude, s.routePosition)
    );

    populateStopDropdown(stopsList);

    mapService = new MapService('map', APP_CONFIG.defaultCenter, APP_CONFIG.defaultZoom);
    mapService.initializeMap();
    mapService.drawRoute(ROUTE_COORDINATES);
    mapService.addBusStops(stopsList);
    mapService.updateBusMarker(initialCoords[0], initialCoords[1], campusBus.busName);

    const select = document.getElementById('stop-selector');
    select.addEventListener('change', (e) => {
        const targetStop = stopsList.find(s => s.stopId === e.target.value);
        currentStudent.selectPickupStop(targetStop || null);
        updateETADisplay();
    });

    console.log('✅ Milestone 4: Khulna map, 15 stops, route, and bus marker loaded.');
}

/**
 * Milestone 8: Subscribes student page to Firebase Realtime Database
 */
function setupLiveTrackingSubscription() {
    if (!trackingService) return;

    const statusBadge = document.getElementById('bus-status-badge');
    const statusText = document.getElementById('bus-status-text');
    const lastUpdated = document.getElementById('last-updated-text');

    trackingService.subscribeToLocation('bus-01', (data) => {
        if (!data) return;

        if (data.status === 'active') {
            campusBus.startTrip(data.driverId || 'driver-101');
            campusBus.updateLocation(data.latitude, data.longitude);

            if (statusBadge) statusBadge.className = 'badge badge-active';
            if (statusText) statusText.textContent = 'Active (Live GPS)';
            if (mapService) mapService.updateBusMarker(data.latitude, data.longitude, campusBus.busName);

            const timeStr = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString();
            if (lastUpdated) lastUpdated.textContent = `${timeStr} (Live Firebase Sync)`;
        } else {
            campusBus.endTrip();
            if (statusBadge) statusBadge.className = 'badge badge-offline';
            if (statusText) statusText.textContent = 'Offline';
            if (lastUpdated) lastUpdated.textContent = 'Bus has concluded its route';
        }

        updateETADisplay();
    });
}

function updateETADisplay() {
    const etaDisplay = document.getElementById('eta-display');
    const etaDetails = document.getElementById('eta-details');
    if (!etaDisplay || !etaDetails) return;

    const selectedStop = currentStudent ? currentStudent.getSelectedStop() : null;

    if (!selectedStop) {
        etaDisplay.textContent = '-- min';
        etaDetails.textContent = 'Select a pickup stop to view estimated arrival';
        return;
    }

    if (!campusBus || !campusBus.isActive()) {
        etaDisplay.textContent = 'Bus Offline';
        etaDetails.textContent = `Awaiting trip start to calculate ETA for ${selectedStop.getStopName()}`;
        return;
    }

    const busLoc = campusBus.getLocation();
    if (!busLoc.latitude || !busLoc.longitude) {
        etaDisplay.textContent = '-- min';
        return;
    }

    const distanceKm = etaService.calculateRemainingDistance(
        busLoc.latitude,
        busLoc.longitude,
        selectedStop,
        ROUTE_COORDINATES
    );

    const etaMin = etaService.calculateETA(distanceKm);
    etaDisplay.textContent = `~${etaMin} min`;
    etaDetails.textContent = `Distance: ${distanceKm} km away from ${selectedStop.getStopName()}`;
}

function setupSimulationControls() {
    const startBtn = document.getElementById('sim-start-btn');
    const resetBtn = document.getElementById('sim-reset-btn');
    const statusBadge = document.getElementById('bus-status-badge');
    const statusText = document.getElementById('bus-status-text');
    const lastUpdated = document.getElementById('last-updated-text');

    if (!startBtn || !resetBtn) return;

    startBtn.addEventListener('click', () => {
        if (simulationInterval) return;

        campusBus.startTrip('simulated-driver-01');
        statusBadge.className = 'badge badge-active';
        statusText.textContent = 'Active (In Transit)';
        startBtn.disabled = true;
        resetBtn.disabled = false;
        updateETADisplay();

        simulationInterval = setInterval(() => {
            currentWaypointIndex = (currentWaypointIndex + 1) % ROUTE_COORDINATES.length;
            const [lat, lng] = ROUTE_COORDINATES[currentWaypointIndex];
            campusBus.updateLocation(lat, lng);
            mapService.updateBusMarker(lat, lng, campusBus.busName);

            if (trackingService) {
                trackingService.publishLocation('bus-01', lat, lng, 'sim-driver');
            }

            const timestamp = new Date().toLocaleTimeString();
            lastUpdated.textContent = `${timestamp} (Waypoint ${currentWaypointIndex + 1}/${ROUTE_COORDINATES.length})`;
            updateETADisplay();
        }, 1500);
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(simulationInterval);
        simulationInterval = null;
        currentWaypointIndex = 0;

        campusBus.endTrip();
        const [initLat, initLng] = ROUTE_COORDINATES[0];
        campusBus.updateLocation(initLat, initLng);
        mapService.updateBusMarker(initLat, initLng, campusBus.busName);

        if (trackingService) {
            trackingService.setBusOffline('bus-01');
        }

        statusBadge.className = 'badge badge-offline';
        statusText.textContent = 'Offline';
        lastUpdated.textContent = 'Awaiting bus signal...';
        startBtn.disabled = false;
        resetBtn.disabled = true;
        updateETADisplay();
    });
}

/* =========================================================
   DRIVER PAGE CONTROLLERS (Milestones 6 & 8)
   ========================================================= */
function initDriverDashboard() {
    activeDriver = new Driver('driver-101', 'Rafiqul Islam', 'driver@unibus.edu', 'bus-01');
    campusBus = new Bus('bus-01', 'BAUST Khulna Shuttle');
    locationService = new LocationService();

    const startTripBtn = document.getElementById('start-trip-btn');
    const endTripBtn = document.getElementById('end-trip-btn');
    const driverBadge = document.getElementById('driver-status-badge');
    const driverStatusText = document.getElementById('driver-status-text');
    const gpsStatusVal = document.getElementById('gps-status-val');
    const latVal = document.getElementById('driver-lat-val');
    const lngVal = document.getElementById('driver-lng-val');
    const packetCount = document.getElementById('driver-packet-count');

    startTripBtn.addEventListener('click', () => {
        gpsStatusVal.textContent = 'Requesting GPS...';
        gpsStatusVal.style.color = 'var(--warning)';

        const started = locationService.startWatching(
            // Success Callback
            (loc) => {
                packetsTransmitted++;
                activeDriver.shareLocation(campusBus, loc.latitude, loc.longitude);

                // Publish coordinates to Firebase Realtime Database
                if (trackingService) {
                    trackingService.publishLocation('bus-01', loc.latitude, loc.longitude, activeDriver.id);
                }

                latVal.textContent = loc.latitude.toFixed(6);
                lngVal.textContent = loc.longitude.toFixed(6);
                packetCount.textContent = packetsTransmitted;
                gpsStatusVal.textContent = `Acquired (±${Math.round(loc.accuracy)}m)`;
                gpsStatusVal.style.color = 'var(--success)';
            },
            // Error Callback
            (error) => {
                gpsStatusVal.textContent = 'GPS Error: ' + error.message;
                gpsStatusVal.style.color = 'var(--danger)';
            }
        );

        if (started) {
            activeDriver.startTrip(campusBus);
            startTripBtn.disabled = true;
            endTripBtn.disabled = false;
            driverBadge.className = 'badge badge-active';
            driverStatusText.textContent = 'Live & Broadcasting';
        }
    });

    endTripBtn.addEventListener('click', () => {
        locationService.stopWatching();
        activeDriver.endTrip(campusBus);

        // Notify Firebase that the bus is offline
        if (trackingService) {
            trackingService.setBusOffline('bus-01');
        }

        startTripBtn.disabled = false;
        endTripBtn.disabled = true;
        driverBadge.className = 'badge badge-offline';
        driverStatusText.textContent = 'Trip Inactive';

        gpsStatusVal.textContent = 'Standby';
        gpsStatusVal.style.color = 'var(--text-main)';
    });
}

/* =========================================================
   AUTHENTICATION LOGIC (Milestone 7)
   ========================================================= */
function initLoginPage() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorBox = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-submit-btn');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errorBox) errorBox.style.display = 'none';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Verifying...';
        }

        try {
            const { role } = await authService.login(emailInput.value.trim(), passwordInput.value);
            if (role === 'driver') {
                window.location.href = 'driver.html';
            } else if (role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            if (errorBox) {
                errorBox.textContent = error.message || 'Invalid credentials.';
                errorBox.style.display = 'block';
            }
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    });
}

function setupGlobalAuthHandlers() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (authService) await authService.logout();
            window.location.href = 'login.html';
        });
    }
}