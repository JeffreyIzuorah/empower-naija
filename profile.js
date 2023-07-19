
const firebaseConfig = {
    apiKey: "AIzaSyDyoUGXsujgMI9yvLftNDneZweyWZSeb8s",
    authDomain: "empower-naija.firebaseapp.com",
    projectId: "empower-naija",
    storageBucket: "empower-naija.appspot.com",
    messagingSenderId: "31519409443",
    appId: "1:31519409443:web:397a432b4ec9c19a0db896",
    measurementId: "G-CN0F62EFT3"
  };
  
  
  
  firebase.initializeApp(firebaseConfig);

  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Get references to form elements
const nameInput = document.getElementById('name');
const locationInput = document.getElementById('location');
const skillsInput = document.getElementById('skills');
const bioInput = document.getElementById('bio');

// Check if a user is logged in
auth.onAuthStateChanged(user => {
  if (user) {
    // User is logged in, retrieve their information from Firestore
    db.collection('users')
      .doc(user.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          const userData = doc.data();
          nameInput.value = user.displayName || '';
          locationInput.value = userData.location || '';
          skillsInput.value = userData.skills || '';
          bioInput.value = userData.bio || '';
        }
      })
      .catch(error => {
        console.error('Error retrieving user data:', error);
      });
  } else {
    // User is not logged in, redirect to login page
    window.location.href = 'login.html';
  }
});
