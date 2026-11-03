import { User } from './User.js';

/**
 * Student class
 * Demonstrates: Inheritance (extends User), Polymorphism
 */
export class Student extends User {
    constructor(id = 'guest-student', name = 'Student Guest', email = 'student@unibus.edu') {
        super(id, name, email, 'student');
        this.selectedStop = null;
    }

    selectPickupStop(busStop) {
        this.selectedStop = busStop;
        return `Selected pickup stop: ${busStop.getStopName()}`;
    }

    getSelectedStop() {
        return this.selectedStop;
    }

    viewBusLocation(bus) {
        if (!bus || bus.getStatus() === 'offline') {
            return 'Bus is currently offline.';
        }
        const coords = bus.getLocation();
        return `Bus [${bus.busName}] is at Lat: ${coords.latitude}, Lng: ${coords.longitude}`;
    }

    viewETA(etaMinutes) {
        if (etaMinutes === null || etaMinutes === undefined || etaMinutes < 0) {
            return 'ETA unavailable (bus is offline or no stop selected)';
        }
        return `Estimated arrival: ~${Math.ceil(etaMinutes)} min`;
    }
}