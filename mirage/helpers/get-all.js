/*eslint no-console: 0*/

import getName from './get-name';

export default function getAll(db, request){
  //turn /api/programyears?limit=1 into 'programYears'
  var modelRegex = /\/api\/([a-z]+).*/i;
  var modelName = getName(request.url.match(modelRegex)[1]);
  if (!db[modelName]) {
    console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + modelName + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.  If the name is camel cased it will need to be created in the get-name module.");
    return;
  }
  var results = db[modelName];
  /*
   * querParams is kind of a mess and comes with values like filters[id]: [4,5,6]
   * so we have to pull out the params with filter in them then test against their
   * values in order to see if an object meets all the requirements
   */
  var params = Object.keys(request.queryParams);
  if(params){
    var paramRegEx = /filters\[([a-z]+)\]/i;
    //get only those filters that we can work with
    var paramFilters = params.filter(function(param){
      return paramRegEx.test(param);
    });
    if(paramFilters){
      //extract the name of the parameter we are filtering along with the value we expect
      var filters = paramFilters.map(function(param){
        var match = param.match(paramRegEx);
        var value = request.queryParams[param];
        //convert string false to boolean false
        if (value === 'false') {
          value = false;
        }
        return {
          param: match[1],
          value: value
        };
      });
      results = results.filter(function(obj){
        var match = true;
        filters.forEach(function(filter){
          let value = filter.value;
          let param = filter.param;
          //for things like filters[id] = [1,11,56]
          if(value instanceof Array){
            var arr = value;
            if(obj[param] === undefined){
              match = false;
            }
            if (obj[param] instanceof Array) {
              match = obj[param].some(function(p) {
                return (arr.indexOf(p.toString()) !== -1);
              });
            } else {
              if(arr.indexOf(obj[param].toString()) === -1) {
                match = false;
              }
            }
          } else {
            //sometimes we are looking for empty values like courses with no sessions
            if(obj[param] === undefined && value !== 'null'){
              match = false;
            } else
            //convert everything to a string and do a strict comparison
            if(obj[param].toString() !== value.toString()){
              match = false;
            }
          }
        });

        return match;
      });
    }

    if('q' in request.queryParams){
      var queryArray = request.queryParams.q.split(" ");
      results = results.filter(function(obj){
        let comparisonString;

        switch (modelName) {
        case 'users':
          comparisonString = (obj.firstName + obj.lastName + obj.middleName + obj.email).toLowerCase();
          break;
        case 'meshDescriptors':
          comparisonString = (obj.name + obj.annotation).toLowerCase();
          break;
        case 'learningMaterials':
          comparisonString = (obj.title).toLowerCase();
          break;
        default:
          console.log('No Q comparison defined for ' + modelName);
          return false;
        }
        var matchedSearchTerms = 0;
        for (let i = 0; i < queryArray.length; i++) {
          var term = queryArray[i].toLowerCase();
          var n = comparisonString.indexOf(term);
          //if the index returned is not -1, increment matchedSearchTerms
          if (n > -1){
            matchedSearchTerms++;
          }
        }
        //if the number of matching search terms is equal to the number searched, return true
        return (matchedSearchTerms === queryArray.length);
      });
    }
  }

  if(request.queryParams.limit){
    results = results.slice(0, request.queryParams.limit);
  }

  var obj = {};
  obj[modelName] = results;

  return obj;
}
