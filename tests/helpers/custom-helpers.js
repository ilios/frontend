/* global window */
import Ember from 'ember';
var customHelpers = function() {
  
  var inflector = Ember.Inflector.inflector;
  // inflector.irregular('aamc-pcrs', 'aamc-pcrses');
  inflector.uncountable('aamcPcrs');
  inflector.uncountable('aamc-pcrs');

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
  Ember.Test.registerAsyncHelper('pauseTest', function(app, duration) {
    return Ember.Test.promise(function(resolve) {
      Ember.Test.adapter.asyncStart();
      var interval = window.setInterval(function(){
        window.clearInterval(interval);
        Ember.Test.adapter.asyncEnd();
        Ember.run(null, resolve, true);
      }, duration);
    });
  });
}();

export default customHelpers;
