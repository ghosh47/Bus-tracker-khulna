/**
 * Base User class
 * Demonstrates: Inheritance (base class for Student, Driver, Admin)
 */
export class User {
    constructor(id, name, email, role) {
        if (new.target === User) {
            // Optional OOP guard: prevents direct instantiation if treated as an abstract base
            // But allows instantiation if needed.
        }
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.isLoggedIn = false;
    }

    login() {
        this.isLoggedIn = true;
        return `${this.name} (${this.role}) has logged in.`;
    }

    logout() {
        this.isLoggedIn = false;
        return `${this.name} has logged out.`;
    }

    getRole() {
        return this.role;
    }

    getProfileSummary() {
        return `${this.name} | Role: ${this.role} | Email: ${this.email}`;
    }
}