

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
const db = firebase.firestore();
const auth = firebase.auth();

// Function to render impact entries in the table
function renderImpactEntries(entries) {
  const impactTable = document.querySelector('.impact-table tbody');

  // Clear existing table rows
  impactTable.innerHTML = '';

  entries.forEach(entry => {
    const { id, date, hours, peopleHelped, location } = entry;
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${date.toDate().toLocaleDateString()}</td>
      <td>${hours}</td>
      <td>${peopleHelped}</td>
      <td>${location}</td>
      <td>
        <button class="btn btn-edit" data-entry-id="${id}">Edit</button>
        <button class="btn btn-delete" data-entry-id="${id}">Delete</button>
      </td>
    `;
    impactTable.appendChild(row);
  });

  // Add event listeners to the edit and delete buttons
  const editButtons = document.querySelectorAll('.btn-edit');
  const deleteButtons = document.querySelectorAll('.btn-delete');

  editButtons.forEach(button => {
    button.addEventListener('click', () => {
      const entryId = button.dataset.entryId;
      // Get the entry data from Firestore
      db.collection('impact_entries').doc(entryId).get()
        .then(doc => {
          if (doc.exists) {
            const entry = doc.data();
            // Populate the form fields with the existing values
            document.getElementById('date').value = entry.date.toDate().toISOString().split('T')[0];
            document.getElementById('hours').value = entry.hours;
            document.getElementById('people-helped').value = entry.peopleHelped;
            document.getElementById('location').value = entry.location;
            // Set the entry ID in the form's dataset
            const impactForm = document.getElementById('impact-form');
            impactForm.dataset.entryId = entryId;
            // Show the modal for editing
            const modal = document.getElementById('impact-modal');
            modal.style.display = 'block';
          } else {
            console.log('Entry not found');
          }
        })
        .catch(error => {
          console.error('Error getting impact entry:', error);
        });
    });
  });

  deleteButtons.forEach(button => {
    button.addEventListener('click', () => {
      const entryId = button.dataset.entryId;
      deleteEntry(entryId);
    });
  });
}

// Handle form submission for adding/editing impact entries
const impactForm = document.getElementById('impact-form');
impactForm.addEventListener('submit', event => {
  event.preventDefault();

  const date = document.getElementById('date').value;
  const hours = document.getElementById('hours').value;
  const peopleHelped = document.getElementById('people-helped').value;
  const location = document.getElementById('location').value;

  // Check if it's an edit or add operation
  const entryId = impactForm.dataset.entryId;

  const user = firebase.auth().currentUser;
  const userId = user ? user.uid : null;

  if (entryId) {
    // Update the existing entry in Firestore
    db.collection('impact_entries').doc(entryId).update({
      date: firebase.firestore.Timestamp.fromDate(new Date(date)),
      hours,
      peopleHelped,
      location
    })
      .then(() => {
        console.log('Entry updated successfully');
        // Clear form fields and close modal
        impactForm.reset();
        delete impactForm.dataset.entryId; // Remove the entry ID from the form dataset
        const modal = document.getElementById('impact-modal');
        modal.style.display = 'none';
      })
      .catch(error => {
        console.error('Error updating impact entry:', error);
      });
  } else {
    // Create a new entry in Firestore
    db.collection('impact_entries').add({
      date: firebase.firestore.Timestamp.fromDate(new Date(date)),
      hours,
      peopleHelped,
      location,
      userId // Add the user's ID to the impact entry document
    })
      .then(() => {
        console.log('Entry added successfully');
        // Clear form fields and close modal
        impactForm.reset();
        const modal = document.getElementById('impact-modal');
        modal.style.display = 'none';
      })
      .catch(error => {
        console.error('Error adding impact entry:', error);
      });
  }
});


// Handle deletion of impact entries
function deleteEntry(entryId) {
  db.collection('impact_entries').doc(entryId).delete()
    .then(() => {
      console.log('Entry deleted successfully');
    })
    .catch(error => {
      console.error('Error deleting impact entry:', error);
    });
}

// Listen for real-time updates to the impact entries collection
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const userId = user.uid;
    db.collection('impact_entries').where('userId', '==', userId).onSnapshot(snapshot => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderImpactEntries(entries);

      // Update the visibility of the impact table and "Add New Entry" button
      const impactTable = document.querySelector('.impact-table');
      const addEntryButton = document.querySelector('.btn-add');

      impactTable.style.display = 'table'; // or 'block' depending on your table styling
      addEntryButton.style.display = 'block'; // or 'inline-block' depending on your button styling
    });
  } else {
    // User is not logged in, clear the impact entries
    renderImpactEntries([]);
  }
});



// Open impact modal
document.addEventListener('DOMContentLoaded', () => {
  const addEntryBtn = document.querySelector('.btn-add');
  const modal = document.getElementById('impact-modal');
  const modalCloseBtn = document.querySelector('.modal-close');

  addEntryBtn.addEventListener('click', () => {
    // Clear form fields and remove data-entry-id attribute
    impactForm.reset();
    delete impactForm.dataset.entryId; // Remove the entry ID from the form dataset
    modal.style.display = 'block';
  });

  modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});


