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
let locationService = null;
let trackingService = null;
let activeDriver = null;
let packetsTransmitted = 0;
let authService = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log(`[BOOT] ${APP_CONFIG.appName} v${APP_CONFIG.version} initialized.`);

    // 1. Initialize Auth and Tracking if Firebase SDK is present
    if (typeof firebase !== 'undefined') {
        try {
            authService = new AuthService();
            trackingService = new TrackingService();
            setupGlobalAuthHandlers();
            console.log('[FIREBASE] Services initialized successfully.');
        } catch (e) {
            console.warn('[FIREBASE NOTICE] Check your keys in config.js.', e);
        }
    }

    // 2. Student Tracking Map Page
    if (document.getElementById('map')) {
        initStudentMapPage();
        setupLiveTrackingSubscription();
    }

    // 3. Driver Dashboard Page
    if (document.getElementById('start-trip-btn')) {
        initDriverDashboard();
    }

    // 4. Portal Login Page
    if (document.getElementById('login-form')) {
        initLoginPage();
    }
});

/* =========================================================
   STUDENT PAGE CONTROLLERS (Live GPS & Geodesic ETA)
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

    console.log('✅ Student map loaded with 15 stops.');
}

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

            // Move the marker to the driver's phone coordinates
            if (mapService) {
                mapService.updateBusMarker(data.latitude, data.longitude, campusBus.busName);
            }

            const timeStr = data.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString();
            if (lastUpdated) {
                lastUpdated.textContent = `${timeStr} (Live GPS)`;
            }
        } else {
            campusBus.endTrip();
            if (statusBadge) statusBadge.className = 'badge badge-offline';
            if (statusText) statusText.textContent = 'Offline';
            if (lastUpdated) {
                lastUpdated.textContent = 'Bus has concluded its route';
            }
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
        etaDetails.textContent = `Awaiting driver trip start to calculate ETA for ${selectedStop.getStopName()}`;
        return;
    }

    const busLoc = campusBus.getLocation();
    if (!busLoc.latitude || !busLoc.longitude) {
        etaDisplay.textContent = '-- min';
        return;
    }

    // Calculate Haversine distance from the driver's phone to the selected stop
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

/* =========================================================
   DRIVER PAGE CONTROLLERS (Live GPS Telemetry)
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
            (loc) => {
                packetsTransmitted++;
                activeDriver.shareLocation(campusBus, loc.latitude, loc.longitude);

                // Publish phone coordinates directly to Firebase Realtime Database
                if (trackingService) {
                    trackingService.publishLocation('bus-01', loc.latitude, loc.longitude, activeDriver.id);
                }

                latVal.textContent = loc.latitude.toFixed(6);
                lngVal.textContent = loc.longitude.toFixed(6);
                packetCount.textContent = packetsTransmitted;
                gpsStatusVal.textContent = `Acquired (±${Math.round(loc.accuracy)}m)`;
                gpsStatusVal.style.color = 'var(--success)';
            },
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
   PORTAL AUTHENTICATION
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