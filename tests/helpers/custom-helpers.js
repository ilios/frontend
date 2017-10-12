import {
  registerAsyncHelper,
  registerHelper
} from '@ember/test';

var customHelpers = function() {
  registerAsyncHelper('pickOption', function(app, selector, optionText, assert){
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
  registerHelper('getElementText', function(app, element){
    if (typeof element === 'string'){
      element = find(element);
    }
    return element.text().replace(/[\t\n\s]+/g, "");
  });
  registerHelper('getText', function(app, string){
    return string.replace(/[\t\n\s]+/g, "");
  });
}();

export default customHelpers;
