/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_TIMEOUT = 250;

export default Component.extend({
  classNames: ['search-box'],
  value: '',
  liveSearch: true,
  'data-test-search-box': true,
  searchTask: task(function * () {
    yield timeout(DEBOUNCE_TIMEOUT);
    const value = this.value;
    yield this.search(value);
  }).restartable(),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('search' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.searchTask.perform();
      return;
    }

    if(27 === keyCode) {
      this.sendAction('clear');
    }
  },
  actions: {
    update(value){
      const liveSearch = this.liveSearch;
      this.set('value', value);
      if (liveSearch) {
        this.searchTask.perform();
      }
    },
    clear() {
      this.set('value', '');
      const clear = this.clear;
      if (isPresent(clear)) {
        clear();
      }
    },
    focus(){
      //place focus into the search box when search icon is clicked
      this.$('input[type="search"]').focus();
    },
  }
});
