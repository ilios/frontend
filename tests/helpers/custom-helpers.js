import Ember from 'ember';
var customHelpers = function() {
  Ember.Test.registerHelper('checkBreadcrumbs', function (app, crumbs) {
    expect(2);
    var crumbsElements = find('ul.breadcrumbs li');
    equal(crumbsElements.length, crumbs.length, "Count Breadcrumbs");
    equal(crumbsElements.text().replace(/\s/g, ""), crumbs.join('').replace(/ /g, ""));
  });
}();

export default customHelpers;
