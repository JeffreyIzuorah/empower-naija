const firebaseConfig = {
    apiKey: "AIzaSyDyoUGXsujgMI9yvLftNDneZweyWZSeb8s",
    authDomain: "empower-naija.firebaseapp.com",
    projectId: "empower-naija",
    storageBucket: "empower-naija.appspot.com",
    messagingSenderId: "31519409443",
    appId: "1:31519409443:web:397a432b4ec9c19a0db896",
    measurementId: "G-CN0F62EFT3"
  };
  
  
  
 // Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Get references to HTML elements
const welcomeMessage = document.getElementById('welcome-message');
const logoutButton = document.getElementById('logout');

// Check if a user is logged in
auth.onAuthStateChanged(user => {
  if (user) {
    // User is logged in
    const displayName = user.displayName;
    welcomeMessage.textContent = `Welcome, ${displayName}!`;
  } else {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html';
  }
});


// Handle logout
logoutButton.addEventListener('click', () => {
  auth.signOut()
    .then(() => {
      // Logout successful, redirect to login page
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Error logging out:', error);
    });
});