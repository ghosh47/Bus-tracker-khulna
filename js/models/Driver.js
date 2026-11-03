import { User } from './User.js';

/**
 * Driver class
 * Demonstrates: Inheritance (extends User), Polymorphism
 */
export class Driver extends User {
    constructor(id, name, email, assignedBusId = null) {
        super(id, name, email, 'driver');
        this.assignedBusId = assignedBusId;
        this.isDriving = false;
    }

    assignBus(busId) {
        this.assignedBusId = busId;
    }

    startTrip(bus) {
        if (bus) {
            bus.startTrip(this.id);
        }
        this.isDriving = true;
        return `Trip started by driver ${this.name} for Bus ${this.assignedBusId || (bus ? bus.busId : 'N/A')}`;
    }

    endTrip(bus) {
        if (bus) {
            bus.endTrip();
        }
        this.isDriving = false;
        return `Trip ended by driver ${this.name}`;
    }

    shareLocation(bus, latitude, longitude) {
        if (!this.isDriving) {
            return 'Cannot share location: trip is not active.';
        }
        if (bus) {
            bus.updateLocation(latitude, longitude);
            return `Location updated: [${latitude}, ${longitude}]`;
        }
        return 'No bus instance associated.';
    }
}