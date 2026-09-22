function displayIliosLoader() {
  // Show the loader only if javascript is enabled
  var iliosLoadingIndicator = document.getElementById('ilios-loading-indicator');
  if (iliosLoadingIndicator) {
    if (window.localStorage) {
      const theme = window.localStorage.getItem('ilios-theme');
      if (['light', 'dark'].includes(theme)) {
        iliosLoadingIndicator.style.colorScheme = theme;
      }
    }

    iliosLoadingIndicator.style.visibility = 'visible';
  }
}

displayIliosLoader();
