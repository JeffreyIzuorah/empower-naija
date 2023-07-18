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

// Get references to form elements
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirm-password');
const registerButton = document.getElementById('register');

// Handle form submission
registerButton.addEventListener('click', event => {
  event.preventDefault();

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Check if password meets requirements (at least 8 characters, containing at least one letter and one number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password.match(passwordRegex)) {
      alert('Password must be at least 8 characters long and contain at least one letter and one number');
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
        alert('Registration successful');
        // Redirect the user to the login page
        window.location.href = 'login.html';
      })
      .catch(error => {
        console.error('Error registering user:', error);
        alert('Error registering user');
      });
  });