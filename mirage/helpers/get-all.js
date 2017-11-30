/*eslint no-console: 0*/
import getName from './get-name';
import { Collection, Model } from 'ember-cli-mirage';

export default function getAll(schema, request){
  //turn /api/programyears?limit=1 into 'programYears'
  const modelRegex = /\/api\/([a-z]+).*/i;
  const modelName = getName(request.url.match(modelRegex)[1]);
  if (!schema[modelName]) {
    console.error("Mirage: The route handler for " + request.url + " is requesting data from the " + modelName + " collection, but that collection doesn't exist. To create it, create an empty fixture file or factory.  If the name is camel cased it will need to be created in the get-name module.");
    return;
  }

  const all = schema[modelName].all();
  const queryParams = extractQueryParams(request);

  const filteredByFilters = filterByFilterParams(all, queryParams.filterParams);
  const filteredByQueryTerms = filterByQueryTerms(filteredByFilters, modelName, queryParams.queryTerms);

  const results = filteredByQueryTerms.slice(0, queryParams.limit);

  return results;
}

/*
 * queryParams is kind of a mess and comes with values like filters[id]: [4,5,6]
 * so we have to pull out the params with filter in them then test against their
 * values in order to see if an object meets all the requirements
 */
const extractQueryParams = function(request){
  const params = Object.keys(request.queryParams);
  let rhett = {
    filterParams: [],
    queryTerms: [],
    limit: 20
  };

  if (params) {
    const filterParamRegEx = /filters\[([a-z]+)\]/i;
    //get only those filters that we can work with
    const filters = params.filter(function(param){
      return filterParamRegEx.test(param);
    });

    rhett.filterParams = filters.map(function(param){
      const match = param.match(filterParamRegEx);
      let value = request.queryParams[param];
      //convert string false to boolean false
      if (value === 'false') {
        value = false;
      }
      return {
        param: match[1],
        value: value
      };
    });

    if(params.includes('q')){
      rhett.queryTerms = request.queryParams.q.split(" ");
    }

    if(params.includes('limit')){
      rhett.limit = parseInt(request.queryParams.limit, 10);
    }
  }

  return rhett;
};

/*
 * Filter possible return values by filters passed in filter[]
 * @param Array all values to filter
 * @param Array filterParams parameters passed in
 * @return Array
 */
const filterByFilterParams = function(all, filterParams){
  if (filterParams.length == 0) {
    return all;
  }
  const results = all.filter(function (obj) {
    let match = true;
    filterParams.forEach(filter => {
      let value = filter.value;
      let param = filter.param;
      //for things like filters[id] = [1,11,56]
      if(value instanceof Array){
        let arr = value;
        if(obj[param] === undefined){
          match = false;
        }
        if (obj[param] instanceof Collection) {
          let result = obj[param].filter(model => {
            return (arr.indexOf(model.id.toString()) !== -1);
          });
          match = result.length > 0;
        } else {
          if(!(param in obj) || arr.indexOf(obj[param].toString()) === -1) {
            match = false;
          }
        }
      } else {
        //sometimes we are looking for empty values like courses with no sessions
        if(obj[param] === undefined && value !== 'null'){
          match = false;
        } else if (obj[param] instanceof Model) {
          if(obj[param].id.toString() !== value.toString()){
            match = false;
          }
        } else if (obj[param] instanceof Collection) {
          let result = obj[param].filter(model => {
            return model.id.toString() === value.toString();
          });
          match = result.length > 0;
        } else
        //convert everything to a string and do a strict comparison
        if(obj[param].toString() !== value.toString()){
          match = false;
        }
      }
    });

    return match;
  });

  return results;
};

/*
 * Filter possible return values by filters passed in filter[]
 * @param Array all values to filter
 * @param Array queryTerms query terms passed in
 * @return Array
 */
const filterByQueryTerms = function(all, modelName, queryTerms){
  if (queryTerms.length == 0) {
    return all;
  }
  const results = all.filter(function(obj){
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
      console.log('No "q" comparison defined for ' + modelName);
      return false;
    }
    const matchedTerms = queryTerms.filter(term => {
      const lcTerm = term.toLowerCase();
      return comparisonString.includes(lcTerm);
    });
    //if the number of matching search terms is equal to the number searched, return true
    return (matchedTerms.length === queryTerms.length);
  });

  return results;
};
