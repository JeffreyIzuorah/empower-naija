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
  

// Function to load chat history
function loadChatHistory(senderId, receiverId) {
    console.log('Sender ID:', senderId);
    console.log('Receiver ID:', receiverId);
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
  
    // Query the messages collection to get the chat history
    const sentMessagesQuery = db
      .collection('messages')
      .where('senderId', '==', senderId)
      .where('receiverId', '==', receiverId);
  
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
          (a, b) =>
            a.data().timestamp.toMillis() - b.data().timestamp.toMillis()
        );
  
        // Add each message to the chat history
        querySnapshot.forEach((doc) => {
          const message = doc.data();
          const messageElement = document.createElement('div');
          messageElement.className = 'message';
          messageElement.textContent = message.content;
          chatHistory.appendChild(messageElement);
        });
  
        // Scroll to the bottom of the chat history
        chatHistory.scrollTop = chatHistory.scrollHeight;
      })
      .catch((error) => {
        console.error('Error loading chat history:', error);
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
  const receiverId = clickedElement.dataset.userId; // Extract the receiverId from the data attribute

  // Load the chat history for the selected user
  loadChatHistory(senderId, receiverId);
}
  
// Event listener for contact list items
contactList.addEventListener('click', (event) => {
    const clickedElement = event.target;
    if (clickedElement.classList.contains('contact')) {
      onContactClick(clickedElement); // Pass the clicked contact element to the function
    }
  });
  

  
  
  
  
