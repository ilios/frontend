module.exports = function(app) {
  var createRouter = require('../helpers/createrouter.js');
  var fixtureStorage = require('../helpers/fixtureStorage.js');
  var fixtures = fixtureStorage.get('users');

  var getGroup = function(name, req, res){
    var fixtureStorage = require('../helpers/fixtureStorage.js');
    var fixtures = fixtureStorage.get(name);
    var responseObj = {};
    var response = [];
    var filterByProperty = function(obj){
        if(filter instanceof Array){
            if(obj[prop] === undefined){
                return false;
            }
            return filter.indexOf(obj[prop].toString()) != -1;
        } else {
            if(obj[prop] === undefined){
                return filter == 'null';
            }
            if (filter == 'false'){
                filter = false;
            }
            return obj[prop] == filter;
        }
    };
    var filterBySearchTerm = function(obj){

        //initialize our vars
        var i;
        var matchedSearchTerms = 0;

        //concatenate the username(s), email, etc into one lowercase string without spaces
        var userInfo = (obj.firstName + obj.middleName + obj.lastName + obj.email).toLowerCase();

        //explode the search terms on each space
        var searchTermArray = req.query.searchTerm.split(" ");

        //loop through the searchTermArray and compare each value against the userInfo
        for (i = 0; i < searchTermArray.length; i++) {
            //set the search term to lowercase
            var term = searchTermArray[i].toLowerCase();
            //search the userInfo string for the term
            var n = userInfo.indexOf(term);
            //if the index returned is not -1, increment matchedSearchTerms
            if (n > -1) matchedSearchTerms = matchedSearchTerms + 1;
        }

        //if the number of matching search terms is equal to the number searched, return true
        return (matchedSearchTerms === searchTermArray.length);

    };
    for(var id in fixtures){
        response.push(fixtures[id]);
    }
    if(req.query !== undefined && req.query.filters !== undefined){
        for(var prop in req.query.filters){
            var filter = req.query.filters[prop];
            //loop through all the responses and if they match this filter, keep them
            response = response.filter(filterByProperty);
        }
    }
    if(req.query !== undefined && req.query.limit !== undefined){
        response = response.slice(0, req.query.limit);
    }
    if(req.query !== undefined && req.query.searchTerm !== undefined){

        response = response.filter(filterBySearchTerm);
    }
    responseObj[name] = response;
    res.send(responseObj);
  };
  var userRouter = createRouter('users', {getGroup:getGroup});
  app.use('/api/users', userRouter);
};
