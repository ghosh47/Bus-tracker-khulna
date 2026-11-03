export class ETAService {
    constructor(averageSpeedKmH = 25) {
        this.averageSpeedKmH = averageSpeedKmH;
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    calculateRemainingDistance(currentLat, currentLng, targetStop, routeCoordinates) {
        if (!targetStop || !currentLat || !currentLng) return null;

        const directDist = this.calculateDistance(
            currentLat,
            currentLng,
            targetStop.latitude,
            targetStop.longitude
        );

        return Math.round(directDist * 100) / 100;
    }

    calculateETA(distanceKm) {
        if (distanceKm === null || distanceKm === undefined || distanceKm <= 0) {
            return 0;
        }

        const hours = distanceKm / this.averageSpeedKmH;
        const minutes = hours * 60;
        return Math.max(1, Math.round(minutes));
    }
}