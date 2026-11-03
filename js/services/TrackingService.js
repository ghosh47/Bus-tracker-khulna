import { FIREBASE_CONFIG } from '../config.js';

export class TrackingService {
    constructor() {
        this.db = null;
        this.activeListeners = {};
        this.initDatabase();
    }

    initDatabase() {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            this.db = firebase.database();
        }
    }

    publishLocation(busId, latitude, longitude, driverId = 'driver-101') {
        if (!this.db) {
            console.error('[TRACKING ERROR] Cannot publish: Firebase database not ready.');
            return Promise.resolve();
        }

        const payload = {
            busId: busId,
            driverId: driverId,
            latitude: Number(latitude),
            longitude: Number(longitude),
            status: 'active',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        };

        return this.db.ref(`tracking/${busId}`).set(payload)
            .then(() => console.log(`[FIREBASE DB] Published coordinates to tracking/${busId}:`, payload))
            .catch(err => console.error('[FIREBASE DB WRITE ERROR]:', err));
    }

    setBusOffline(busId) {
        if (!this.db) return Promise.resolve();

        return this.db.ref(`tracking/${busId}`).update({
            status: 'offline',
            updatedAt: firebase.database.ServerValue.TIMESTAMP
        }).then(() => console.log(`[FIREBASE DB] Bus ${busId} set to offline.`));
    }

    subscribeToLocation(busId, onUpdate) {
        if (!this.db) {
            console.error('[TRACKING ERROR] Cannot subscribe: Firebase database not ready.');
            return;
        }

        console.log(`[FIREBASE DB] Listening on tracking/${busId}...`);
        const busRef = this.db.ref(`tracking/${busId}`);
        const listener = busRef.on('value', (snapshot) => {
            const data = snapshot.val();
            console.log('[FIREBASE DB] Received snapshot on index.html:', data);
            if (data && onUpdate) {
                onUpdate(data);
            }
        }, (error) => {
            console.error('[FIREBASE DB READ ERROR]:', error);
        });

        this.activeListeners[busId] = { ref: busRef, listener: listener };
    }

    unsubscribeFromLocation(busId) {
        if (this.activeListeners[busId]) {
            const { ref, listener } = this.activeListeners[busId];
            ref.off('value', listener);
            delete this.activeListeners[busId];
        }
    }
}