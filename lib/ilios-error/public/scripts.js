/* global document */

//after 20 seconds display the error message
setTimeout(function(){
  const loadingIndicator = document.getElementById('ilios-loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  const errorContainer = document.getElementById('ilios-loading-error');
  if (errorContainer) {
    errorContainer.classList.remove('hidden');
  }
}, 20000);
