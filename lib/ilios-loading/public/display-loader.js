/* global document */
function displayIliosLoader() {
  // Show the loader only if javascript is enabled
  var iliosLoadingIndicator = document.getElementById('ilios-loading-indicator');
  if (iliosLoadingIndicator) {
    iliosLoadingIndicator.style.visibility = 'visible';
  }
}

displayIliosLoader();
