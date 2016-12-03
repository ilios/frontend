import Ember from 'ember';

export function removeHtmlTags(params) {
  if (!(params[0] === undefined)) {
    return jQuery("<p>" + params[0] + "</p>").text();
  }  
}

export default Ember.Helper.helper(removeHtmlTags);

