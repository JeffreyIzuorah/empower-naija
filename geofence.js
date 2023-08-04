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

  function handleClockIn(userLocation, opportunity, hoursSpent) {
    // Record the impact entry with the number of hours spent
    const date = new Date();
  
    // Add a new impact entry to the Firestore database
    db.collection("impact_entries")
      .add({
        userId: firebase.auth().currentUser.uid,
        date: firebase.firestore.Timestamp.fromDate(date),
        hours: hoursSpent,
        peopleHelped: 0,
        location: opportunity.locationName,
      })
      .then(() => {
        console.log("Impact entry recorded.");
      })
      .catch((error) => {
        console.error("Error recording impact entry:", error);
      });
  }


// Function to accept the clock-in
// function acceptClockIn(opportunity) {
//     handleVolunteerAction(userLocation, opportunity);
//     startGeofenceMonitoring(opportunity, handleClockIn);
//   }
