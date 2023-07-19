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

// Check if a user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
      // User is logged in, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  });
  

// Get references to form elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login');
const flashMessagesContainer = document.getElementById('flash-messages');

// Handle form submission
loginButton.addEventListener('click', event => {
  event.preventDefault();

  const email = emailInput.value;
  const password = passwordInput.value;

  // Login the user with Firebase Authentication
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      // Login successful
      window.location.href = 'dashboard.html';
    })
    .catch(error => {
      console.error('Error logging in:', error);
      displayFlashMessage('Invalid username or password', 'error');
    });
});

// Display flash messages
function displayFlashMessage(message, type = 'success') {
  // Remove existing flash messages
  while (flashMessagesContainer.firstChild) {
    flashMessagesContainer.firstChild.remove();
  }

  // Create and add new flash message
  const flashMessage = document.createElement('div');
  flashMessage.className = `flash-message ${type}`;
  flashMessage.textContent = message;
  flashMessagesContainer.appendChild(flashMessage);
}