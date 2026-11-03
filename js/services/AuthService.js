import { FIREBASE_CONFIG } from '../config.js';

/**
 * AuthService class
 * Demonstrates: Abstraction (encapsulates Firebase Auth SDK and role authorization)
 */
export class AuthService {
    constructor() {
        this.auth = null;
        this.initFirebase();
    }

    initFirebase() {
        if (!firebase.apps.length) {
            firebase.initializeApp(FIREBASE_CONFIG);
        }
        this.auth = firebase.auth();
    }

    /**
     * Signs in user with email and password
     * Returns { user, role }
     */
    async login(email, password) {
        const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        const role = this.determineRole(user.email);
        return { user, role };
    }

    /**
     * Signs out current user
     */
    async logout() {
        if (this.auth) {
            await this.auth.signOut();
        }
    }

    /**
     * Infers role based on institutional email prefix
     */
    determineRole(email) {
        if (!email) return 'guest';
        const lower = email.toLowerCase();
        if (lower.startsWith('admin')) return 'admin';
        if (lower.startsWith('driver')) return 'driver';
        return 'student';
    }

    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }
}