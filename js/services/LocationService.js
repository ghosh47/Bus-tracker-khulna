/**
 * LocationService class
 * Demonstrates: Abstraction (hiding Geolocation API details & watch listeners)
 */
export class LocationService {
    constructor() {
        this.watchId = null;
        this.isTracking = false;
        this.options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
    }

    /**
     * Checks if geolocation is supported by the current browser
     */
    isSupported() {
        return 'geolocation' in navigator;
    }

    /**
     * Starts continuous GPS tracking via watchPosition
     * @param {Function} onLocationSuccess - callback receiving { latitude, longitude, accuracy, timestamp }
     * @param {Function} onLocationError - callback receiving error object
     */
    startWatching(onLocationSuccess, onLocationError) {
        if (!this.isSupported()) {
            if (onLocationError) {
                onLocationError(new Error('Geolocation is not supported by your browser.'));
            }
            return false;
        }

        if (this.isTracking) {
            return true; // Already active
        }

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const payload = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };
                if (onLocationSuccess) onLocationSuccess(payload);
            },
            (error) => {
                if (onLocationError) onLocationError(error);
            },
            this.options
        );

        this.isTracking = true;
        return true;
    }

    /**
     * Stops GPS tracking and clears active watch listener
     */
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
    }

    /**
     * Fetches a one-time single snapshot of the current location
     */
    getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!this.isSupported()) {
                reject(new Error('Geolocation is not supported.'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                }),
                (err) => reject(err),
                this.options
            );
        });
    }

    getStatus() {
        return this.isTracking ? 'active' : 'idle';
    }
}