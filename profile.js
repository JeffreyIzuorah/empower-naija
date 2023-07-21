
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

// ... Your existing code to retrieve user data and populate the form fields ...

// Get reference to the form element
const profileForm = document.querySelector('.profile-form');

// Event listener for the "Save Changes" button
profileForm.addEventListener('submit', e => {
  e.preventDefault(); // Prevent the form from submitting

  // Get the edited values from the form fields
  const editedData = {
    location: locationInput.value.trim(),
    skills: skillsInput.value.trim(),
    bio: bioInput.value.trim()
  };

  // Update the user document in the "users" collection with the edited data
  db.collection('users')
    .doc(auth.currentUser.uid)
    .update(editedData)
    .then(() => {
      console.log('User profile updated successfully');
      // Redirect the user to the dashboard after successful update
      window.location.href = 'dashboard.html';
    })
    .catch(error => {
      console.error('Error updating user profile:', error);
      // Handle the error, show an alert, or other appropriate actions
    });
});

// Event listener for the "Cancel" button
const cancelButton = document.querySelector('.btn-secondary');
cancelButton.addEventListener('click', () => {
  // Redirect the user to the dashboard when cancel is clicked
  window.location.href = 'dashboard.html';
});

// ... Your existing code ...

// Get the reference to the location input field
// const locationInput = document.getElementById('location');

// Function to get the user's current location and save it to Firestore
function getCurrentLocation() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
  
          // Save the user's latitude and longitude to Firestore
          const userRef = db.collection('users').doc(auth.currentUser.uid);
          userRef.update({
            latitude: latitude,
            longitude: longitude
          })
          .then(() => {
            console.log('User location updated successfully');
          })
          .catch(error => {
            console.error('Error updating user location:', error);
          });
        },
        error => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation not available in this browser');
    }
  }
  
  // Call the function to get the current location and save it to Firestore when the page loads
  getCurrentLocation();

