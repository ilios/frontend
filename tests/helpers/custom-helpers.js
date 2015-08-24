import Ember from 'ember';

var customHelpers = function() {
  Ember.Test.registerAsyncHelper('pickOption', function(app, selector, optionText, assert){
    assert.equal(find(selector).length, 1, selector + ' is a valid selector');
    let option = find(selector).find('option').filter(function() {
      return this.text === optionText;
    });
    option.prop('selected', true);
    triggerEvent(option, 'change');
    
    return app.testHelpers.wait();
  });
  Ember.Test.registerHelper('getElementText', function(app, element){
    return element.text().replace(/[\t\n\s]+/g, "");
  });
  Ember.Test.registerHelper('getText', function(app, string){
    return string.replace(/[\t\n\s]+/g, "");
  });
}();

export default customHelpers;
