// Firebase Configuration
// This file contains Firebase configuration

window.firebaseConfig = {
    apiKey: "AIzaSyBJDhjAO85qtK4SexkvvLIgvs36i3Chyf4",
    authDomain: "eee-routine.firebaseapp.com",
    databaseURL: "https://eee-routine-default-rtdb.firebaseio.com",
    projectId: "eee-routine",
    storageBucket: "eee-routine.firebasestorage.app",
    messagingSenderId: "1001291186233",
    appId: "1:1001291186233:web:801a065bc6f3304e1d8de8",
    measurementId: "G-16X655Y9KQ"
};

if (firebase.apps.length === 0) {
    firebase.initializeApp(window.firebaseConfig);
}
