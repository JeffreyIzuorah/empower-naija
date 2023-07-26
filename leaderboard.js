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
  
  async function renderLeaderboard() {
    try {
      const usersSnapshot = await db.collection('users').get();
      const usersData = {};
  
      usersSnapshot.forEach(doc => {
        const user = doc.data();
        usersData[user.userId] = {
          userId: user.userId,
          displayName: user.name || 'Anonymous', // Use 'Anonymous' if displayName is not available
          points: 0
        };
      });
  
      // Fetch all impact entries
      const impactSnapshot = await db.collection('impact_entries').get();
      impactSnapshot.forEach(doc => {
        const entry = doc.data();
        if (entry.userId in usersData) {
          usersData[entry.userId].points += entry.hours;
        }
      });
  
      const sortedUsers = Object.values(usersData).sort((a, b) => b.points - a.points);
  
      const leaderboardList = document.querySelector('.leaderboard-list');
      leaderboardList.innerHTML = '';
  
      sortedUsers.forEach((user, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="number">${index + 1}</td>
          <td class="name">${user.displayName}</td>
          <td class="points">${user.points}</td>
        `;
        leaderboardList.appendChild(row);
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }
  
  // Call the function to render the leaderboard when the DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    renderLeaderboard();
  });
  