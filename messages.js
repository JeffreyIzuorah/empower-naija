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



// At the top of messages.js (before other event listeners)
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      // Call the loadContacts function only when the user is logged in
      loadContacts();
    } else {
      // Handle the case when the user is not logged in
      console.error('User not logged in.');
    }
  });
  

  
// Get references to UI elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const contactList = document.querySelector('.contact-list');
const chat = document.querySelector('.chat');
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
 
  

  let lastDisplayedTimestamp = null;

function loadChatHistory(senderId, receiverId) {
  // Clear the chat history
  chatHeader.textContent = ''; // Clear the chat header
  chatHistory.innerHTML = ''; // Clear the chat history
  // Set the chat history section to visible
  chat.style.display = 'block';
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
  const sentMessagesQuery = db
    .collection('messages')
    .where('senderId', '==', senderId)
    .where('receiverId', '==', receiverId);

  // Query for messages received by the current user (receiver)
  const receivedMessagesQuery = db
    .collection('messages')
    .where('senderId', '==', receiverId)
    .where('receiverId', '==', senderId);

  // Combine both queries into one query using Promise.all
  Promise.all([sentMessagesQuery.get(), receivedMessagesQuery.get()])
    .then((querySnapshots) => {
      // Combine and sort the query results
      const querySnapshot = querySnapshots.reduce(
        (result, snapshot) => result.concat(snapshot.docs),
        []
      );

      querySnapshot.sort(
        (a, b) => a.data().timestamp.toMillis() - b.data().timestamp.toMillis()
      );

      // Add each message to the chat history
      querySnapshot.forEach((doc) => {
        const message = doc.data();
        const messageElement = document.createElement('div');
        messageElement.className = `message ${
          message.senderId === senderId ? 'sender-message' : 'receiver-message'
        }`;
        messageElement.innerHTML = `<p>${message.content}</p>`;
        chatHistory.appendChild(messageElement);

        // Update the last displayed timestamp
        lastDisplayedTimestamp = message.timestamp;

        // Scroll to the bottom of the chat history
        chatHistory.scrollTop = chatHistory.scrollHeight;
      });
    })
    .catch((error) => {
      console.error('Error loading chat history:', error);
    });

  // Real-time listener for incoming messages for the receiver's chat history
  db.collection('messages')
    .where('senderId', '==', receiverId)
    .where('receiverId', '==', senderId)
    .orderBy('timestamp', 'asc')
    .onSnapshot((snapshot) => {
      // Get the added messages from the snapshot
      const addedMessages = snapshot.docChanges().filter((change) => change.type === 'added');

      // Add only new messages to the chat history
      addedMessages.forEach((change) => {
        const message = change.doc.data();

        // Check if the message has a timestamp greater than the last displayed timestamp
        if (!lastDisplayedTimestamp || message.timestamp.toMillis() > lastDisplayedTimestamp.toMillis()) {
          const messageElement = document.createElement('div');
          messageElement.className = `message receiver-message`;
          messageElement.innerHTML = `<p>${message.content}</p>`;
          chatHistory.appendChild(messageElement);

          // Update the last displayed timestamp
          lastDisplayedTimestamp = message.timestamp;

          // Scroll to the bottom of the chat history
          chatHistory.scrollTop = chatHistory.scrollHeight;
        }
      });
    });

  // Update receiver's contact list with the sender's ID
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
    chat.style.display = 'block';
    // Get the current logged-in user
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('User not logged in.');
      return;
    }
  
    // Get the sender and receiver IDs
    const senderId = user.uid;
    const newReceiverId = clickedElement.dataset.userId; // Extract the receiverId from the data attribute
  
    // Check if the selected user is the current chat partner
    if (selectedReceiverId === newReceiverId) {
      return; // Skip loading chat history if the selected user is already the current chat partner
    }
  
    // Update the selectedReceiverId to the new selected user
    selectedReceiverId = newReceiverId;
  
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
      const receiverId = selectedReceiverId;
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
  
      // Create a new message document in Firestore
      db.collection('messages')
        .add({
          senderId,
          receiverId,
          content: messageContent,
          timestamp,
        })
        .then(() => {
          console.log('Message sent successfully');
          messageInput.value = ''; // Clear the input field after sending the message
  
          // After successfully sending the message, directly add it to the chat history
          const messageElement = document.createElement('div');
          messageElement.className = `message sender-message`;
          messageElement.innerHTML = `<p>${messageContent}</p>`;
          chatHistory.appendChild(messageElement);
  
          // Scroll to the bottom of the chat history
          chatHistory.scrollTop = chatHistory.scrollHeight;
  
          // Update receiver's contact list with the sender's ID
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
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });
    }
  });
  
  
  function loadContacts() {
    const user = firebase.auth().currentUser;
    if (!user) {
      console.error('User not logged in.');
      return;
    }
  
    const userId = user.uid;
  
    // Fetch the user document of the logged-in user
    db.collection('users')
      .doc(userId)
      .get()
      .then((doc) => {
        const user = doc.data();
        const contacts = user.contacts || []; // Get the contacts array, or use an empty array if it's undefined
  
        // Clear the contact list
        contactList.innerHTML = '';
  
        // Add each contact to the contact list
        contacts.forEach((contactId) => {
          db.collection('users')
            .doc(contactId)
            .get()
            .then((contactDoc) => {
              const contact = contactDoc.data();
              const contactElement = document.createElement('li');
              contactElement.className = 'contact';
              contactElement.textContent = contact.name;
              contactElement.setAttribute('data-user-id', contactId);
              contactList.appendChild(contactElement);
            })
            .catch((error) => {
              console.error('Error loading contact:', error);
            });
        });
      })
      .catch((error) => {
        console.error('Error loading user data:', error);
      });
  }