// System & Route Configurations
export const APP_CONFIG = {
    appName: "UniBus Tracker",
    version: "1.0.0",
    defaultCenter: [22.8400, 89.5400], // Centered over Khulna city
    defaultZoom: 13,
    averageSpeedKmH: 25 // Realistic bus speed in Khulna city traffic
};

// Official Khulna City Route Pickup Stops (From Schedule)
export const DEFAULT_STOPS = [
    { id: "stop-1",  name: "Campus (ক্যাম্পাস)", latitude: 22.8900, longitude: 89.5050, routePosition: 0 },
    { id: "stop-2",  name: "Notun Rasta (নতুন রাস্তা)", latitude: 22.8552, longitude: 89.5325, routePosition: 1 },
    { id: "stop-3",  name: "Shibbari Mor (শিব বাড়ি মোড়)", latitude: 22.8256, longitude: 89.5535, routePosition: 2 },
    { id: "stop-4",  name: "Dakbangla (ডাক বাংলা)", latitude: 22.8130, longitude: 89.5635, routePosition: 3 },
    { id: "stop-5",  name: "Zilla School (জিলা স্কুল)", latitude: 22.8115, longitude: 89.5670, routePosition: 4 },
    { id: "stop-6",  name: "Rupsha Traffic Mor (রূপসা ট্রাফিক মোড়)", latitude: 22.8015, longitude: 89.5745, routePosition: 5 },
    { id: "stop-7",  name: "PTI Mor (পি টি আই মোড়)", latitude: 22.8090, longitude: 89.5605, routePosition: 6 },
    { id: "stop-8",  name: "Royal Mor (রয়েল মোড়)", latitude: 22.8175, longitude: 89.5570, routePosition: 7 },
    { id: "stop-9",  name: "Moylapota Mor (ময়লাপোতা মোড়)", latitude: 22.8205, longitude: 89.5495, routePosition: 8 },
    { id: "stop-10", name: "Shibbari Mor 2 (শিব বাড়ি ফিরতি)", latitude: 22.8256, longitude: 89.5535, routePosition: 9 },
    { id: "stop-11", name: "Sonadanga Bus Terminal (সোনাডাঙ্গা)", latitude: 22.8280, longitude: 89.5385, routePosition: 10 },
    { id: "stop-12", name: "Boyra Bazar Mor (বয়রা বাজার মোড়)", latitude: 22.8440, longitude: 89.5395, routePosition: 11 },
    { id: "stop-13", name: "Muzgunni (মুজগুন্নী)", latitude: 22.8580, longitude: 89.5240, routePosition: 12 },
    { id: "stop-14", name: "Notun Rasta 2 (নতুন রাস্তা ফিরতি)", latitude: 22.8552, longitude: 89.5325, routePosition: 13 },
    { id: "stop-15", name: "Daulatpur (দৌলতপুর)", latitude: 22.8750, longitude: 89.5160, routePosition: 14 }
];

// Complete Polyline Route Path tracing through Khulna
export const ROUTE_COORDINATES = [
    [22.8900, 89.5050], // Campus
    [22.8750, 89.5160], // Towards Daulatpur
    [22.8552, 89.5325], // Notun Rasta
    [22.8440, 89.5395], // Boyra
    [22.8256, 89.5535], // Shibbari
    [22.8130, 89.5635], // Dakbangla
    [22.8115, 89.5670], // Zilla School
    [22.8015, 89.5745], // Rupsha
    [22.8090, 89.5605], // PTI Mor
    [22.8175, 89.5570], // Royal Mor
    [22.8205, 89.5495], // Moylapota
    [22.8256, 89.5535], // Shibbari
    [22.8280, 89.5385], // Sonadanga
    [22.8440, 89.5395], // Boyra Bazar
    [22.8580, 89.5240], // Muzgunni
    [22.8552, 89.5325], // Notun Rasta
    [22.8750, 89.5160]  // Daulatpur
];

// Exported Firebase Configuration with Realtime Database URL
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCzOQC6mUt2cIYqnQFDHqUQnjlxe7_SZ0U",
    authDomain: "unibus-tracker-24468.firebaseapp.com",
    databaseURL: "https://unibus-tracker-24468-default-rtdb.firebaseio.com/",
    projectId: "unibus-tracker-24468",
    storageBucket: "unibus-tracker-24468.firebasestorage.app",
    messagingSenderId: "990562725529",
    appId: "1:990562725529:web:c22ec1c62c761842489208"
};