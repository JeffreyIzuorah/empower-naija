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
  const auth = firebase.auth();

// Add this at the top of messages.js
let selectedReceiverId = null;

  
// Get references to UI elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const contactList = document.querySelector('.contact-list');
const chatHeader = document.querySelector('.chat-header h2');
const chatHistory = document.querySelector('.chat-history');
const messageInput = document.querySelector('.message-input textarea');
const sendButton = document.querySelector('.send-button');

// Get the logged-in user's ID
const userId = auth.currentUser ? auth.currentUser.uid : null;

// Function to search for users
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.trim();
  
    // Perform the search query to find users
    db.collection('users')
      .where('name', '>=', searchTerm)
      .where('name', '<=', searchTerm + '\uf8ff')
      .get()
      .then((querySnapshot) => {
        contactList.innerHTML = ''; // Clear the previous search results
  
        // Add the search results to the contact list
        querySnapshot.forEach((doc) => {
          const user = doc.data();
          const contact = document.createElement('li');
          contact.className = 'contact';
          contact.textContent = user.name;
          contact.setAttribute('data-user-id', doc.id);
          contactList.appendChild(contact);
        });
      })
      .catch((error) => {
        console.error('Error searching for users:', error);
      });
  });
  

  function loadChatHistory(senderId, receiverId) {
    // Clear the chat history
    chatHeader.textContent = ''; // Clear the chat header
    chatHistory.innerHTML = ''; // Clear the chat history
  
    // Get the display name of the selected user
    db.collection('users')
      .doc(receiverId)
      .get()
      .then((doc) => {
        const user = doc.data();
        chatHeader.textContent = user.name;
      })
      .catch((error) => {
        console.error('Error getting user data:', error);
      });
  
    // Query for messages sent by the current user (sender)
    const sentMessagesQuery = db.collection('messages')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId)
      .orderBy('timestamp', 'asc');
  
    // Query for messages received by the current user (receiver)
    const receivedMessagesQuery = db.collection('messages')
      .where('senderId', '==', receiverId)
      .where('receiverId', '==', senderId)
      .orderBy('timestamp', 'asc');
  
    // Listen for real-time updates on new messages sent by the sender
    sentMessagesQuery.onSnapshot(snapshot => {
      chatHistory.innerHTML = ''; // Clear the chat history
  
      snapshot.docs.forEach(doc => {
        const message = doc.data();
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message.content;
        chatHistory.appendChild(messageElement);
      });
  
      // Scroll to the bottom of the chat history
      chatHistory.scrollTop = chatHistory.scrollHeight;
    });
  
    // Listen for real-time updates on new messages received by the receiver
    receivedMessagesQuery.onSnapshot(snapshot => {
      snapshot.docs.forEach(doc => {
        const message = doc.data();
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.textContent = message.content;
        chatHistory.appendChild(messageElement);
      });
  
      // Scroll to the bottom of the chat history
      chatHistory.scrollTop = chatHistory.scrollHeight;
    });

    db.collection('users')
    .doc(receiverId)
    .update({
      contacts: firebase.firestore.FieldValue.arrayUnion(senderId)
    })
    .then(() => {
      console.log('Sender added to the contact list');
    })
    .catch((error) => {
      console.error('Error adding sender to the contact list:', error);
    });
  }
  


function onContactClick(clickedElement) {
  // Get the current logged-in user
  const user = firebase.auth().currentUser;
  if (!user) {
    console.error('User not logged in.');
    return;
  }

  // Get the sender and receiver IDs
  const senderId = user.uid;
  selectedReceiverId = clickedElement.dataset.userId; // Extract the receiverId from the data attribute


  // Load the chat history for the selected user
  loadChatHistory(senderId, selectedReceiverId);
}
  
// Event listener for contact list items
contactList.addEventListener('click', (event) => {
    const clickedElement = event.target;
    if (clickedElement.classList.contains('contact')) {
      onContactClick(clickedElement); // Pass the clicked contact element to the function
    }
  });

  sendButton.addEventListener('click', () => {
    const messageContent = messageInput.value.trim();
    if (messageContent !== '') {
      const senderId = auth.currentUser.uid;
      const receiverId = selectedReceiverId // The receiver's display name is stored in chatHeader.textContent
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
      // Create a new message document in Firestore
      db.collection('messages').add({
        senderId,
        receiverId,
        content: messageContent,
        timestamp,
      })
      .then(() => {
        console.log('Message sent successfully');
        messageInput.value = ''; // Clear the input field after sending the message
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
    }
     // After successfully sending the message
  db.collection('users')
  .doc(senderId)
  .update({
    contacts: firebase.firestore.FieldValue.arrayUnion(receiverId)
  })
  .then(() => {
    console.log('Receiver added to the contact list');
    messageInput.value = ''; // Clear the input field after sending the message
  })
  .catch((error) => {
    console.error('Error adding receiver to the contact list:', error);
  });
  });
  
  

  
  
  
  
