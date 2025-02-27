document.getElementById("google-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevents page reload
  let formData = new FormData(event.target);

  fetch(event.target.action, {
    method: "POST",
    body: formData,
    mode: "no-cors" // Google Forms does not return CORS headers
  }).then(() => {
    document.getElementById("submission-message").style.display = "block";
    document.getElementById("email-input").value = ""; // Clear input
  }).catch((error) => {
    console.error("Error submitting form:", error);
    alert("Error submitting form. Please try again.");
  });
});