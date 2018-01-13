import { findElementWithAssert } from 'ember-cli-page-object/extend';
import wait from 'ember-test-helpers/wait';

export default function selectable(selector, options = {}) {
  return {
    isDescriptor: true,

    get() {
      return async function (value) {
        const el = findElementWithAssert(this, selector, options);
        let selectOptions = el.find('option').filter(function() {
          return this.text === value;
        });
        if(selectOptions.length){
          let option = selectOptions[0];
          el.selectedIndex = option.index;
          triggerEvent(selectOptions, 'change');
        }
        await wait();
        await wait();
        return wait();
      };
    }
  };
}
