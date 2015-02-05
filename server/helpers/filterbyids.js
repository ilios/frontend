module.exports = function(ids, fixtures) {
  var response = [];
  for(var i = 0; i< ids.length; i++){
    if(ids[i] in fixtures){
      response.push(fixtures[ids[i]]);
    }
  }

  return response;
};
