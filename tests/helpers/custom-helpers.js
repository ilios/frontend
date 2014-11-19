import Ember from 'ember';
var customHelpers = function() {
  Ember.Test.registerHelper('checkBreadcrumbs', function (app, crumbs) {
    var crumbsElements = find('ul.breadcrumbs li');
    equal(crumbsElements.length, crumbs.length, "Count Breadcrumbs");
    equal(crumbsElements.text().replace(/\s/g, ""), crumbs.join('').replace(/ /g, ""));
  });
  Ember.Test.registerHelper('pickOption', function(app, selector, optionText){
    equal(find(selector).length, 1, selector + ' is not a valid selector');
    find(selector).find('option').filter(function() {
      return this.text === optionText;
    }).prop('selected', true);
    return triggerEvent(selector, 'change');
  });
}();

export default customHelpers;
