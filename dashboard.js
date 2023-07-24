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
    // ... Your existing code ...

// Add this after the welcomeMessage.textContent line
const notification = document.getElementById('notification');

// Listen for real-time updates to messages where the current user is the receiver
const messagesCollection = db.collection('messages');
messagesCollection
  .where('receiverId', '==', user.uid)
  .orderBy('timestamp', 'desc')
  .onSnapshot((snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    // Now you have the messages for the current user
    console.log('Received Messages:', messages);

    // Update the UI to display the messages (in the notification area)
    const messageList = document.getElementById('message-list');
    messageList.innerHTML = '';
    messages.forEach((message) => {
      const listItem = document.createElement('li');
      listItem.textContent = `From: ${message.senderId}, Message: ${message.content}`;
      messageList.appendChild(listItem);
    });

    // Show a notification if there are new messages
    const newMessageCount = messages.length;
    if (newMessageCount > 0) {
      notification.textContent = `You have ${newMessageCount} new messages!`;
    } else {
      notification.textContent = ''; // Hide the notification if no new messages
    }
  });

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