// index.js - Main script for your app

document.addEventListener('DOMContentLoaded', () => {
    // You can add general logic for your app here
    console.log('Home Page Loaded');
    // Example: Check if the user has been logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('User is logged in');
    } else {
      console.log('User is not logged in');
    }
  });
  