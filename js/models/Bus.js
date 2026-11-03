/**
 * Bus class
 * Demonstrates: Encapsulation (state protection & controlled mutations)
 */
export class Bus {
    #latitude;
    #longitude;
    #status; // 'active' | 'offline'

    constructor(busId, busName, initialLat = null, initialLng = null) {
        this.busId = busId;
        this.busName = busName;
        this.driverId = null;
        this.#latitude = initialLat;
        this.#longitude = initialLng;
        this.#status = 'offline';
        this.lastUpdated = null;
    }

    updateLocation(lat, lng) {
        this.#latitude = Number(lat);
        this.#longitude = Number(lng);
        this.lastUpdated = new Date();
    }

    getLocation() {
        return {
            latitude: this.#latitude,
            longitude: this.#longitude
        };
    }

    startTrip(driverId) {
        this.driverId = driverId;
        this.#status = 'active';
        this.lastUpdated = new Date();
    }

    endTrip() {
        this.#status = 'offline';
        this.lastUpdated = new Date();
    }

    getStatus() {
        return this.#status;
    }

    isActive() {
        return this.#status === 'active';
    }
}