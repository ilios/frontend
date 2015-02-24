//after 10 second display the error message
setTimeout(function(){
  $('#initialpageloader .waveloader').remove();
  $('#browsererrormessage').removeClass('hidden');
}, 10000);
