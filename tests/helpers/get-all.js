export default function getAll(queryParams, model){
  var response = model;
  /*
   * querParams is kind of a mess and comes with values like filters[id]: [4,5,6]
   * so we have to pull out the params with filter in them then test against their
   * values in order to see if an object meets all the requirements
   */
  var params = Object.keys(queryParams);
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
        var value = queryParams[param];
        //convert string false to boolean false
        if (value === 'false') {
          value = false;
        }
        return {
          param: match[1],
          value: value
        };
      });
      response = response.filter(function(obj){
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
            if(arr.indexOf(obj[param].toString()) === -1){
              match = false;
            }
          } else {
            //sometimes we are looking for empty values like courses with no sessions
            if(obj[param] === undefined && value !== 'null'){
              match = false;
            }
            //convert everything to a string and do a strict comparison
            if(obj[param].toString() !== value.toString()){
              match = false;
            }
          }
        });

        return match;
      });
    }
  }
  if(queryParams.limit){
    response = response.slice(0, queryParams.limit);
  }
  return response;
}
