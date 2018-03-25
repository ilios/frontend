/* global document, window */

// if there is an uncaught runtime error show the error message
window.addEventListener('error', function () {
  var loadingIndicator = document.getElementById('ilios-loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.parentNode.removeChild(loadingIndicator);
  }
  var errorContainer = document.getElementById('ilios-loading-error');
  if (errorContainer) {
    errorContainer.classList.remove('hidden');
  }
});
