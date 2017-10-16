//after 20 seconds display the error message
setTimeout(function(){
  $('.ilios-loading-indicator').remove();
  $('#browsererrormessage').removeClass('hidden');
}, 20000);
