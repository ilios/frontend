import Ember from 'ember';

var customHelpers = function() {
  Ember.Test.registerAsyncHelper('pickOption', function(app, selector, optionText, assert){
    let el = find(selector);
    assert.equal(el.length, 1, selector + ' is a valid selector');
    let options = el.find('option').filter(function() {
      return this.text === optionText;
    });
    if(options.length){
      let option = options[0];
      let select = option.parentElement;
      select.selectedIndex = option.index;
      triggerEvent(options, 'change');
    }
    
    
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
