/**
 * MapService class
 * Demonstrates: Abstraction (encapsulating Leaflet API and tile management)
 */
export class MapService {
    constructor(containerId, initialCenter = [22.8189, 89.5534], initialZoom = 14) {
        this.containerId = containerId;
        this.initialCenter = initialCenter;
        this.initialZoom = initialZoom;
        this.map = null;
        this.busMarker = null;
        this.stopMarkers = [];
        this.routePolyline = null;
    }

    /**
     * Initializes the Leaflet map and attaches OpenStreetMap tiles
     */
    initializeMap() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.warn(`Map container #${this.containerId} not found on this page.`);
            return null;
        }

        // Initialize Leaflet instance
        this.map = L.map(this.containerId).setView(this.initialCenter, this.initialZoom);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        return this.map;
    }

    /**
     * Draws the bus route path line on the map
     */
    drawRoute(coordinates, color = '#2563eb') {
        if (!this.map) return;
        if (this.routePolyline) {
            this.map.removeLayer(this.routePolyline);
        }

        this.routePolyline = L.polyline(coordinates, {
            color: color,
            weight: 5,
            opacity: 0.75,
            smoothFactor: 1
        }).addTo(this.map);

        this.map.fitBounds(this.routePolyline.getBounds(), { padding: [40, 40] });
    }

    /**
     * Adds visual markers for all pickup stops
     */
    addBusStops(stops) {
        if (!this.map) return;

        const stopIcon = L.divIcon({
            className: 'custom-stop-marker',
            html: `<div style="background:#1e3a8a; color:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.3);">🚏</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        stops.forEach((stop) => {
            const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon })
                .addTo(this.map)
                .bindPopup(`<strong>Stop ${stop.routePosition + 1}:</strong> ${stop.name}`);

            this.stopMarkers.push(marker);
        });
    }

    /**
     * Adds or updates the Bus location marker with smooth pan
     */
    updateBusMarker(latitude, longitude, busName = 'Campus Shuttle #1') {
        if (!this.map) return;

        const busIcon = L.divIcon({
            className: 'custom-bus-marker',
            html: `<div style="background:#dc2626; color:white; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; font-size:18px; border:3px solid white; box-shadow:0 3px 8px rgba(0,0,0,0.4); animation: pulse 2s infinite;">🚌</div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        });

        if (!this.busMarker) {
            this.busMarker = L.marker([latitude, longitude], { icon: busIcon })
                .addTo(this.map)
                .bindPopup(`<strong>${busName}</strong><br>Status: Active`);
        } else {
            // Smoothly move marker to new coordinate
            this.busMarker.setLatLng([latitude, longitude]);
        }
    }

    /**
     * Centers view on the bus
     */
    focusOnBus() {
        if (this.busMarker && this.map) {
            this.map.panTo(this.busMarker.getLatLng());
        }
    }
}