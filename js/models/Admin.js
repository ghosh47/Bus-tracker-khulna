import { User } from './User.js';

/**
 * Admin class
 * Demonstrates: Inheritance (extends User), Polymorphism
 */
export class Admin extends User {
    constructor(id, name, email) {
        super(id, name, email, 'admin');
    }

    manageBus(bus, newName) {
        if (!bus) return 'Bus not found';
        bus.busName = newName;
        return `Bus ${bus.busId} renamed to ${newName}`;
    }

    manageDriver(driver, newAssignedBusId) {
        if (!driver) return 'Driver not found';
        driver.assignBus(newAssignedBusId);
        return `Driver ${driver.name} assigned to bus ${newAssignedBusId}`;
    }

    manageStops(stopsList, newStop) {
        stopsList.push(newStop);
        return `Added new stop: ${newStop.getStopName()}`;
    }
}