# UniBus Tracker 🚌
> Real-Time University Bus Tracking System Built with Pure OOP JavaScript, Leaflet.js, and Firebase.

UniBus Tracker is an end-to-end telemetry and fleet tracking solution designed for university campus transit. It features a public student tracking interface with real-time ETA estimates, an authenticated driver dashboard broadcasting live HTML5 Geolocation coordinates, and Firebase Realtime Database cloud synchronization.

---

## 🌟 Features

- **Real-Time GPS Synchronization:** Uses `navigator.geolocation.watchPosition` to stream live driver telemetry directly into Firebase Realtime Database.
- **Dynamic Geodesic ETA:** Employs the Haversine formula to compute great-circle distance between moving buses and 15 Khulna transit stops at typical city transit speeds.
- **Robust Simulation Fallback:** Fully functional offline waypoint simulator allows realistic demonstrations without requiring mobile vehicle movement.
- **Role-Based Authentication:** Clean separation of Driver and Admin portals via Firebase Auth and modular service abstractions.
- **Zero-Build Architecture:** Pure ES6+ modular JavaScript running directly in the browser via native ES Modules—no bundlers or heavy node runtimes required.

---

## 🏗️ System Architecture & OOP Design

The project strictly adheres to Object-Oriented Programming (OOP) paradigms:

- **Domain Models (`/js/models/`):**
  - `User.js` (Base class for identity)
  - `Driver.js`, `Student.js`, `Admin.js` (Inheritance & polymorphism)
  - `Bus.js` (Encapsulation of operational state, speed, and GPS coordinates)
  - `BusStop.js` (Geographic waypoint representations)

- **Service Layer (`/js/services/`):**
  - `MapService.js`: Abstracts Leaflet.js map lifecycle, layers, markers, and custom icons.
  - `LocationService.js`: Encapsulates browser Geolocation APIs and diagnostic telemetry.
  - `AuthService.js`: Wraps Firebase Authentication and credential validation.
  - `TrackingService.js`: Manages pub/sub WebSocket channels to Firebase Realtime Database.
  - `ETAService.js`: Modular geodesic distance and arrival calculation.

---

## 🚀 Getting Started

### Prerequisites
- Modern Web Browser (Chrome, Edge, Firefox)
- VS Code with **Live Server** extension (or any local static HTTP server)

### Installation & Run
1. Clone or download the repository:
   ```bash
   git clone [https://github.com/your-username/unibus-tracker.git](https://github.com/your-username/unibus-tracker.git)
   cd unibus-tracker