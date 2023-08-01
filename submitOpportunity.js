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
  

  const submitForm = document.getElementById('submit-form');

  submitForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    const name = submitForm.name.value;
    const description = submitForm.description.value;
    const latitude = marker.getPosition().lat();
    const longitude = marker.getPosition().lng();
  
    // Use Geocoding API to get the actual location name from the selected latitude and longitude
    getLocationName(latitude, longitude)
      .then((actualLocationName) => {
        // Save the opportunity to Firestore with the actual location name
        db.collection('opportunities').add({
          name: name,
          description: description,
          latitude: latitude,
          longitude: longitude,
          locationName: actualLocationName,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          volunteers: []
        })
        .then(() => {
          alert('Opportunity submitted successfully!');
          submitForm.reset();
        })
        .catch((error) => {
          console.error('Error submitting opportunity:', error);
        });
      })
      .catch((error) => {
        console.error('Error getting location name:', error);
      });
  });
  
  
  

// submitOpportunitiesMap.js
let map;
let marker;

function initMap() {
  // Set the initial map center (e.g., a default location)
  const initialLocation = { lat: 40.7128, lng: -74.0060 };
  
  map = new google.maps.Map(document.getElementById("map"), {
    center: initialLocation,
    zoom: 12,
  });

  // Add a click event listener to the map to place a marker at the clicked location
  map.addListener("click", (event) => {
    if (marker) {
      marker.setMap(null);
    }

    marker = new google.maps.Marker({
      position: event.latLng,
      map,
    });

    // Update the location input field with the selected latitude and longitude
    const locationInput = document.getElementById("location");
    locationInput.value = `${event.latLng.lat()}, ${event.latLng.lng()}`;
  });

 // Create the search input and link it to the HTML input field with id "search-location"
 const input = document.getElementById("search-location");
 const searchBox = new google.maps.places.SearchBox(input);
 map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

 // Bias the searchBox results towards the current map's viewport
 map.addListener("bounds_changed", () => {
   searchBox.setBounds(map.getBounds());
 });

 // Listen for the event when the user selects a location from the search box
 searchBox.addListener("places_changed", () => {
   const places = searchBox.getPlaces();

   if (places.length === 0) {
     return;
   }

   // Clear any existing markers
   if (marker) {
     marker.setMap(null);
   }

   // Create a new marker for the selected place
   marker = new google.maps.Marker({
     position: places[0].geometry.location,
     map: map,
   });

   // Update the map center to the selected place
   map.setCenter(places[0].geometry.location);

   // Update the location input field with the selected latitude and longitude
   const locationInput = document.getElementById("location");
   locationInput.value = `${places[0].geometry.location.lat()}, ${places[0].geometry.location.lng()}`;
 });   
}
