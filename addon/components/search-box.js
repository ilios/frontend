/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import layout from '../templates/components/search-box';

const DEBOUNCE_TIMEOUT = 250;

export default Component.extend({
  layout,
  classNames: ['search-box'],
  value: '',
  liveSearch: true,
  'data-test-search-box': true,
  searchTask: task(function * () {
    yield timeout(DEBOUNCE_TIMEOUT);
    const value = this.get('value');
    yield this.get('search')(value);
  }).restartable(),

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('search' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.get('searchTask').perform();
      return;
    }

    if(27 === keyCode) {
      this.sendAction('clear');
    }
  },
  actions: {
    update(value){
      const liveSearch = this.get('liveSearch');
      this.set('value', value);
      if (liveSearch) {
        this.get('searchTask').perform();
      }
    },
    clear() {
      this.set('value', '');
      const clear = this.get('clear');
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
