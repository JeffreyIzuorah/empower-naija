document.getElementById('volunteer-signup-form').addEventListener('submit', function(event) {
    event.preventDefault();
  
    // Perform form validation
    var fullName = document.getElementById('full-name').value;
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirm-password').value;
    var termsChecked = document.getElementById('terms').checked;
  
    if (!fullName || !email || !password || !confirmPassword || !termsChecked) {
      alert('Please fill in all required fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    // Perform vetting processes (e.g., backend API calls for verification, checking references)

    // Prepare form data to send to the server
  var formData = new FormData();
  formData.append('full-name', document.getElementById('full-name').value);
  formData.append('email', document.getElementById('email').value);
  formData.append('password', document.getElementById('password').value);
  formData.append('confirm-password', document.getElementById('confirm-password').value);
  formData.append('bio', document.getElementById('bio').value);
  formData.append('skills', document.getElementById('skills').value);
  formData.append('experience', document.getElementById('experience').value);
  formData.append('references', document.getElementById('references').value);
  formData.append('id-upload', document.getElementById('id-upload').files[0]);

  // Send the form data to the backend
  // You can use AJAX or fetch to send a request to your backend server to store the user data
  // In this example, we are using fetch
  fetch('your-backend-url', {
    method: 'POST',
    body: formData
  })
    .then(function(response) {
      if (response.ok) {
        // Clear the form fields
        document.getElementById('volunteer-signup-form').reset();

        // Redirect to a confirmation page or show a success message
        alert('Thank you for signing up as a volunteer!');
      } else {
        // Handle errors if the request fails
        alert('Failed to sign up. Please try again.');
      }
    })
    .catch(function(error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    });
});
  
    // Submit the form data to the backend
    // You can use AJAX or fetch to send a request to your backend server to store the user data
  
