
document.addEventListener("DOMContentLoaded", function() {
  if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/js/service-worker.js').then(function(registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        }, function(error) {
          console.log('Service Worker registration failed:', error);
        });
      });
  }
  document.addEventListener('input', saveAllText); // Save text on any input change
  window.addEventListener("load", () => {
    restoreAllText(); // Restore text when the page loads
  });
})

// Save text for all input and textarea elements
function saveAllText() {
  const inputs = document.querySelectorAll('input[type=text], textarea');
  inputs.forEach((input) => {
      const key = `input-${input.id}`;
      localStorage.setItem(key, input.value);
  });
}

// Restore text for all input and textarea elements
function restoreAllText() {
  const inputs = document.querySelectorAll('input[type=text], textarea');
  inputs.forEach((input) => {
      const key = `input-${input.id}`;
      const savedValue = localStorage.getItem(key);
      if (savedValue !== null) {
          input.value = savedValue;
      }
  });
}
