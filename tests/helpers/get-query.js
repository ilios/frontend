export default function getAll(q, name, model, limit){
  var response = model;
  //explode the search terms on each space
  var queryArray = q.split(" ");
  response = response.filter(function(obj){
    let comparisonString;

    switch (name) {
      case 'meshDescriptors':
        comparisonString = (obj.name + obj.annotation).toLowerCase();
        break;
      default:
        console.log('No Q comparison defined for ' + name);
        return false;
    }
    var matchedSearchTerms = 0;
    for (let i = 0; i < queryArray.length; i++) {
        var term = queryArray[i].toLowerCase();
        var n = comparisonString.indexOf(term);
        //if the index returned is not -1, increment matchedSearchTerms
        if (n > -1) matchedSearchTerms = matchedSearchTerms + 1;
    }
    //if the number of matching search terms is equal to the number searched, return true
    return (matchedSearchTerms === queryArray.length);
  });
  return response;
}
