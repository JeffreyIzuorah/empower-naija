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
const db = firebase.firestore();

// Check if a user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
      // User is logged in, redirect to dashboard
      window.location.href = 'dashboard.html';
    }
  });
  

// Get references to form elements and flash messages container
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const passwordToggle = document.getElementById('password-toggle');
const registerButton = document.getElementById('register');
const flashMessagesContainer = document.getElementById('flash-messages');

// Handle password visibility toggle
passwordToggle.addEventListener('change', () => {
  const passwordType = passwordInput.type;
  passwordInput.type = passwordType === 'password' ? 'text' : 'password';
  confirmPasswordInput.type = passwordType === 'password' ? 'text' : 'password';
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
  

// Handle form submission
registerButton.addEventListener('click', event => {
  event.preventDefault();

  const name = nameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Check if passwords match
  if (password !== confirmPassword) {
    displayFlashMessage('Passwords do not match', 'error');
    return;
  }

  // Check if password meets requirements (at least 8 characters, containing at least one letter and one number)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!password.match(passwordRegex)) {
    displayFlashMessage('Password must be at least 8 characters long and contain at least one letter and one number', 'error');
    return;
  }

  // Register the user with Firebase Authentication
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      // Registration successful, update user profile with name
      const user = userCredential.user;
      return user.updateProfile({
        displayName: name
      });
    })
    .then(() => {
      displayFlashMessage('Registration successful', 'success');
      // Redirect the user to the login page
      window.location.href = 'login.html';
    })
    .catch(error => {
      console.error('Error registering user:', error);
      displayFlashMessage('Error registering user', 'error');
    });
});

const user = firebase.auth().currentUser;

// Create a user document in the "users" collection
db.collection('users')
  .doc(user.uid)
  .set({
    name: user.displayName || '', // Assuming the user has a display name
    location: '',
    skills: '',
    bio: ''
  })
  .then(() => {
    console.log('User document created successfully');
  })
  .catch(error => {
    console.error('Error creating user document:', error);
  });