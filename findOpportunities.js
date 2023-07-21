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
    return distance;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }



// Function to fetch the user's location from Firestore
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
    return db.collection("opportunities").get()
      .then((querySnapshot) => {
        const opportunities = [];
        querySnapshot.forEach((doc) => {
          const opportunity = doc.data();
          opportunity.id = doc.id;
          opportunities.push(opportunity);
        });
        return opportunities;
      });
  }

// Function to display the sorted opportunities on the page
function displayOpportunities(opportunities) {
    const opportunitiesContainer = document.querySelector(".locations");
    opportunitiesContainer.innerHTML = ""; // Clear previous opportunities
  
    opportunities.forEach((opportunity) => {
      const opportunityCard = document.createElement("div");
      opportunityCard.classList.add("location");
  
      const locationElement = document.createElement("h3");
      locationElement.textContent = opportunity.locationName; // Display the opportunity's location name
      opportunityCard.appendChild(locationElement);
  
      const descriptionElement = document.createElement("p");
      descriptionElement.textContent = opportunity.description;
      opportunityCard.appendChild(descriptionElement);
  
      const volunteerButton = document.createElement("button");
      volunteerButton.classList.add("btn");
      volunteerButton.textContent = "Volunteer";
      opportunityCard.appendChild(volunteerButton);
  
      opportunitiesContainer.appendChild(opportunityCard);
    });
  }

  // Function to sort the opportunities by distance from the user's location
  function sortOpportunitiesByDistance(userLocation, opportunities) {
    opportunities.sort((a, b) => {
      const distanceA = calculateDistance(userLocation.lat, userLocation.lng, a.location.latitude, a.location.longitude);
      const distanceB = calculateDistance(userLocation.lat, userLocation.lng, b.location.latitude, b.location.longitude);
      return distanceA - distanceB;
    });
    return opportunities;
  }

  // Function to fetch user's location, opportunities, and display the sorted opportunities
 // Function to fetch user's location, opportunities, and display the sorted opportunities
async function fetchAndDisplayOpportunities() {
    try {
      const userLocation = await getUserLocation();
      const opportunities = await getOpportunities();
      const sortedOpportunities = sortOpportunitiesByDistance(userLocation, opportunities);
      displayOpportunities(sortedOpportunities);
    } catch (error) {
      console.error("Error fetching and displaying opportunities:", error);
    }
  }
  

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
  
