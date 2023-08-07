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
  const perf = firebase.performance();
  const db = firebase.firestore();


// Function to calculate the distance between two coordinates using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return Number(distance.toFixed(2)); // Return the distance as a number with 2 decimal places
}

const lat1 = 20.0157049; // Replace with a valid latitude value
const lon1 = 57.5678122; // Replace with a valid longitude value
const lat2 = -20.1020349; // Replace with another valid latitude value
const lon2 = 57.5624505; // Replace with another valid longitude value

const distance = calculateDistance(lat1, lon1, lat2, lon2);
console.log("Distance:", distance); 

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  function getUserLocation() {
    return new Promise((resolve, reject) => {
      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        unsubscribe(); // Unsubscribe the listener once it's triggered
  
        if (!user) {
          reject(new Error("User not logged in."));
        } else {
          db.collection("users")
            .doc(user.uid)
            .get()
            .then((doc) => {
              if (doc.exists) {
                const userData = doc.data();
                console.log("Latitude:", userData.latitude);
                console.log("Longitude:", userData.longitude);
                resolve({ lat: userData.latitude, lng: userData.longitude });
              } else {
                reject(new Error("User location not found."));
              }
            })
            .catch((error) => {
              reject(error);
            });
        }
      });
    });
  }
  

// Function to fetch all opportunities from Firestore
function getOpportunities() {
    return db.collection("opportunities")
      .get()
      .then((querySnapshot) => {
        const opportunities = [];
        querySnapshot.forEach((doc) => {
          const opportunity = doc.data();
          opportunity.id = doc.id;
          opportunity.volunteers = opportunity.volunteers || []; 
          opportunities.push(opportunity);
        });
        return opportunities;
      })
      .catch((error) => {
        console.error("Error fetching opportunities:", error);
        throw error;
      });
  }
  
  const displayTrace = perf.trace('displayOpportunities');

// Function to display the sorted opportunities on the page
function displayOpportunities(userLocation, opportunities) {
    // displayTrace.start();
    const opportunitiesContainer = document.querySelector(".locations");
    opportunitiesContainer.innerHTML = ""; // Clear previous opportunities
  
    opportunities.forEach((opportunity) => {
      const opportunityCard = document.createElement("div");
      opportunityCard.classList.add("location");

          // Add an event listener for the opportunity card
    // opportunityCard.addEventListener("click", () => {
    //     // Call the function to display the full opportunity details
    //     displayOpportunityDetails(userLocation, opportunity);
    //   });
  
      const locationElement = document.createElement("h3");
      locationElement.textContent = opportunity.locationName; // Display the opportunity's location name
      opportunityCard.appendChild(locationElement);
  
      const descriptionElement = document.createElement("p");
      descriptionElement.textContent = opportunity.description;
      opportunityCard.appendChild(descriptionElement);
  
      const distanceElement = document.createElement("p");
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        opportunity.latitude,
        opportunity.longitude
      );
      console.log(opportunity.latitude)
      distanceElement.textContent = `Distance: ${distance.toFixed(2)} km`; // Display the distance
      opportunityCard.appendChild(distanceElement);
  
      const volunteerButton = document.createElement("button");
      volunteerButton.classList.add("btn");
    // Check if the user has volunteered for this opportunity
    const userId = firebase.auth().currentUser.uid;
    const userHasVolunteered = hasVolunteeredForOpportunity(opportunity, userId);

    if (userHasVolunteered) {
      volunteerButton.textContent = "Withdraw";
      volunteerButton.addEventListener("click", () => {
        handleWithdrawAction(userLocation, opportunity);
      });
    } else {
      volunteerButton.textContent = "Volunteer";
      volunteerButton.addEventListener("click", () => {
        displayOpportunityDetails(userLocation, opportunity);
        // handleVolunteerAction(userLocation, opportunity);
      });
    }
  
    opportunityCard.appendChild(volunteerButton);
      opportunitiesContainer.appendChild(opportunityCard);
    });
    // displayTrace.stop();
  }
  
// Function to handle the volunteer action when the "Volunteer" button is clicked
function handleVolunteerAction(userLocation, opportunity) {
    const userId = firebase.auth().currentUser.uid;
  
    // Check if the user has not already volunteered for this opportunity
    if (!hasVolunteeredForOpportunity(opportunity, userId)) {
      // Add the user to the volunteers list
      opportunity.volunteers.push(userId);
  
      // Update the opportunity in the Firestore database with the new volunteers list
      db.collection("opportunities")
        .doc(opportunity.id)
        .update({
          volunteers: opportunity.volunteers,
        })
        .then(() => {
          console.log("Volunteer successful.");

        // Start geofence monitoring when the user volunteers for the opportunity
        startGeofenceMonitoring(opportunity, (enteredOpportunity) => {
            // Callback function to handle the clock-in process when the user enters the opportunity area
            handleClockIn(userLocation, enteredOpportunity);
          });

                  // Automatically record the impact when the user volunteers for the opportunity
        const date = new Date();
        const hoursVolunteered = 0; // Initialize to 0 hours, user can edit later

        // Add a new impact entry to the Firestore database
        db.collection("impact_entries")
          .add({
            userId,
            date: firebase.firestore.Timestamp.fromDate(date),
            hours: hoursVolunteered,
            peopleHelped: 0,
            location: opportunity.locationName,
          })
          .then(() => {
            console.log("Impact entry recorded.");
          })
          .catch((error) => {
            console.error("Error recording impact entry:", error);
          });

          const flashMessage = createFlashMessage("You have volunteered for this opportunity!", "flash-message");
          document.body.appendChild(flashMessage);
          // Optionally, you can refresh the opportunities data without reloading the whole page
          // For example, by calling the fetchAndDisplayOpportunities function again
          fetchAndDisplayOpportunities();
          // Refresh the opportunity details in the modal to update the volunteers count and "Withdraw" button display
          
        })
        .catch((error) => {
          console.error("Error volunteering:", error);
        });
    }
  }

  function createFlashMessage(message, className) {
    const flashMessage = document.createElement("div");
    flashMessage.classList.add(className);
    flashMessage.textContent = message;
  
    // Add an event listener to remove the flash message when clicked
    flashMessage.addEventListener("click", () => {
      flashMessage.remove();
    });
  
    return flashMessage;
  }

  // Function to get the names of volunteers based on their IDs
function getVolunteersNames(volunteerIds) {
    const volunteersPromises = volunteerIds.map((volunteerId) => {
      return db
        .collection("users")
        .doc(volunteerId)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const volunteerData = doc.data();
            return volunteerData.name; // Assuming the user's display name is stored in the 'displayName' field
          } else {
            return "Unknown Volunteer"; // If the user document doesn't exist or displayName is not available
          }
        })
        .catch((error) => {
          console.error("Error fetching volunteer data:", error);
          return "Unknown Volunteer"; // If there's an error fetching the user data
        });
    });
  
    return Promise.all(volunteersPromises);
  }
  

  // Function to sort the opportunities by distance from the user's location
  function sortOpportunitiesByDistance(userLocation, opportunities) {
    opportunities.sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
      return distanceA - distanceB;
    });
    return opportunities;
  }

// Function to fetch user's location, opportunities, and display the sorted opportunities
function fetchAndDisplayOpportunities() {
    console.log('i dey work')
    let userLocation; // Declare userLocation variable here
  
    getUserLocation()
      .then((location) => {
        userLocation = location; // Assign the value of location to userLocation
        return getOpportunities();
      })
      .then((opportunities) => {
        const sortedOpportunities = sortOpportunitiesByDistance(userLocation, opportunities);
        displayOpportunities(userLocation, sortedOpportunities); // Pass userLocation here
      })
      .catch((error) => {
        console.error("Error fetching and displaying opportunities:", error);
      });
  }
  
  // Function to display the full opportunity details when the opportunity card is clicked
function displayOpportunityDetails(userLocation, opportunity) {
    const opportunityModal = document.getElementById("opportunityModal");
    const locationElement = opportunityModal.querySelector(".opportunity-location");
    const descriptionElement = opportunityModal.querySelector(".opportunity-description");
    const distanceElement = opportunityModal.querySelector(".opportunity-distance");
    const volunteersElement = opportunityModal.querySelector(".opportunity-volunteers");
    const confirmButton = opportunityModal.querySelector(".btn-success");
    const cancelButton = opportunityModal.querySelector(".btn-danger");
    const withdrawButton = opportunityModal.querySelector(".withdraw-btn");

      // Check if the user has volunteered for this opportunity
  const userId = firebase.auth().currentUser.uid;
//   const userHasVolunteered = hasVolunteeredForOpportunity(opportunity, userId);

    // // Display the 'Withdraw' button if the user has volunteered for this opportunity
    // if (userHasVolunteered) {
    //     withdrawButton.style.display = "block";
    //   } else {
    //     withdrawButton.style.display = "none";
    //   }

      // Add an event listener for the Confirm button
  confirmButton.addEventListener("click", () => {
        // Prompt the user with the toast message and clock-in process
            handleVolunteerAction(userLocation, opportunity);
            // Start geofence monitoring when the user volunteers for the opportunity
            startGeofenceMonitoring(opportunity);

    // Close the opportunity modal after handling the volunteer action
    opportunityModal.style.display = "none";
  });

  // Add an event listener for the Cancel button
  cancelButton.addEventListener("click", () => {
    // Close the opportunity modal without any further action
    opportunityModal.style.display = "none";
  });

    // Fetch the names of volunteers and display them in the modal
    getVolunteersNames(opportunity.volunteers)
    .then((volunteersNames) => {
      const volunteersList = volunteersNames.join(", ");
      volunteersElement.textContent = ` ${volunteersList}`;
    })
    .catch((error) => {
      console.error("Error fetching volunteers names:", error);
      volunteersElement.textContent = " Unknown";
    });
  
    // Set the content of the opportunity details elements
    locationElement.textContent = opportunity.locationName;
    descriptionElement.textContent = opportunity.description;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      opportunity.latitude,
      opportunity.longitude
    );
    distanceElement.textContent = `Distance: ${distance.toFixed(2)} km`;
    volunteersElement.textContent = `Volunteers: ${opportunity.volunteers.length}`;
  
  // Display the opportunity modal
  opportunityModal.style.display = "block";
  }

  // Close the opportunity modal when the close button is clicked
document.getElementById("opportunityModal").addEventListener("click", (event) => {
    if (event.target.classList.contains("close")) {
      const opportunityModal = document.getElementById("opportunityModal");
      opportunityModal.style.display = "none";
    }
  });
  

  // Call the function to fetch and display opportunities when the page loads
  window.addEventListener("DOMContentLoaded", fetchAndDisplayOpportunities);

  function getLocationName(lat, lng) {
    return new Promise((resolve, reject) => {
      const geocoder = new google.maps.Geocoder();
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
  
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
          if (results[0]) {
            resolve(results[0].formatted_address);
          } else {
            reject(new Error("Location not found"));
          }
        } else {
          reject(new Error("Geocoder failed due to: " + status));
        }
      });
    });
  }

  // Function to check if the user has volunteered for an opportunity
function hasVolunteeredForOpportunity(opportunity, userId) {
    return opportunity.volunteers.includes(userId);
  }


// Function to handle the volunteer withdrawal action when the "Withdraw" button is clicked
function handleWithdrawAction(userLocation, opportunity) {
    const userId = firebase.auth().currentUser.uid;
  
    // Check if the user has volunteered for this opportunity
    if (hasVolunteeredForOpportunity(opportunity, userId)) {
      // Remove the user from the volunteers list
      const updatedVolunteers = opportunity.volunteers.filter((volunteerId) => volunteerId !== userId);
  
      // Update the opportunity in the Firestore database with the new volunteers list
      db.collection("opportunities")
        .doc(opportunity.id)
        .update({
          volunteers: updatedVolunteers,
        })
        .then(() => {
          console.log("Volunteer withdrawal successful.");

          stopGeofenceMonitoring();

          const flashMessage = createFlashMessage("You have withdrawn from this opportunity!", "flash-message-withdraw");
          document.body.appendChild(flashMessage);
          // Refresh the opportunity details in the modal to update the volunteers count
          fetchAndDisplayOpportunities();
        })
        .catch((error) => {
          console.error("Error withdrawing volunteer:", error);
        });
    }
  }


//Geofence handling

// Function to start geofence monitoring
function startGeofenceMonitoring(opportunity, onEnterOpportunityArea) {
    const opportunityArea = {
      latitude: opportunity.latitude,
      longitude: opportunity.longitude,
      radius: 0.1, // Replace with the desired radius in kilometers
    };
  
    let userInsideOpportunity = false;
    let entryTime = null;
  
    function checkUserLocation(userLocation) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        opportunityArea.latitude,
        opportunityArea.longitude
      );
  
      if (distance <= opportunityArea.radius) {
        // User is in the opportunity area
        if (!userInsideOpportunity) {
          // User just entered the opportunity area
          userInsideOpportunity = true;
          entryTime = new Date();
  
          // Show the notification to the user
        //   showOpportunityEntryNotification(opportunity);
        showGeofenceToast(opportunity);
        }
      } else {
        // User has left the opportunity area
        if (userInsideOpportunity) {
          // User just exited the opportunity area, calculate hours and record impact entry
          const exitTime = new Date();
          const hoursSpent = calculateHoursSpent(entryTime, exitTime);
          if (hoursSpent > 0) {
            handleClockIn(userLocation, opportunity, hoursSpent);
          }
          userInsideOpportunity = false;
          entryTime = null;
        }
      }
    }
  
    // Start monitoring user's location using a location tracking library
    // For example, you can use the Geolocation API to get the user's current location
    // and then call the checkUserLocation function with the user's location.
    // For simplicity, I'm assuming you have a function `getUserLocation` to get the user's location.
  
    getUserLocation()
      .then((userLocation) => {
        checkUserLocation(userLocation); // Check the user's location initially
  
        setInterval(() => {
          getUserLocation()
            .then((userLocation) => {
              checkUserLocation(userLocation);
            })
            .catch((error) => {
              console.error("Error getting user location:", error);
            });
        }, 60000); // Check every minute, adjust as per your needs
      })
      .catch((error) => {
        console.error("Error getting user location:", error);
      });
  }
  
  // Function to show the notification when the user enters the opportunity area
  function showOpportunityEntryNotification(opportunity) {
    // Replace this with your custom notification implementation
    // For example, you can show a toast message, a modal, or any other type of notification
    // that prompts the user to start recording their impact hours.
    showGeofenceToast(opportunity);
    // alert(`You are in the opportunity area: ${opportunity.locationName}`);
    console.log("You are in the opportunity area:", opportunity.locationName);
    console.log("Do you want to start recording your impact hours?");
  }
  
  
  // Function to calculate the number of hours spent between two Date objects
  function calculateHoursSpent(entryTime, exitTime) {
    const millisecondsSpent = exitTime.getTime() - entryTime.getTime();
    const hoursSpent = millisecondsSpent / (1000 * 60 * 60); // Convert milliseconds to hours
    return hoursSpent;
  }
  
// Function to display the geofence toast
function showGeofenceToast(opportunity) {
    
    const toast = new bootstrap.Toast(document.getElementById("geofenceToast"), {
        autohide: false, // Prevent auto-hiding
        delay: 10000, // Set a custom delay in milliseconds (10 seconds in this case)
      });
    const toastBody = toast._element.querySelector(".toast-body");
    toastBody.innerHTML = `You are near ${opportunity.locationName}. Would you like to clock in? 
      <button type="button" class="btn btn-success ms-2" onclick="handleClockIn(userLocation, opportunity)">Yes</button>`;
  
    toast.show();
  }
  

  let geofenceIntervalId = null; // To store the interval ID

function stopGeofenceMonitoring() {
  if (geofenceIntervalId !== null) {
    clearInterval(geofenceIntervalId);
    geofenceIntervalId = null;
    console.log("Geofence monitoring stopped.");
  } else {
    console.log("Geofence monitoring is not active.");
  }
}
  
  
  