/**
 * BusStop class
 * Represents predefined pickup points along the route
 */
export class BusStop {
    constructor(stopId, stopName, latitude, longitude, routePosition) {
        this.stopId = stopId;
        this.stopName = stopName;
        this.latitude = Number(latitude);
        this.longitude = Number(longitude);
        this.routePosition = Number(routePosition); // Sequence index: 0, 1, 2, ...
    }

    getStopName() {
        return this.stopName;
    }

    getCoordinates() {
        return [this.latitude, this.longitude];
    }
}