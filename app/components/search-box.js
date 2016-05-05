import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';

const { Component } = Ember;
const DEBOUNCE_TIMEOUT = 250;

export default Component.extend({
  classNames: ['search-box'],
  value: '',
  liveSearch: true,
  searchTask: task(function * () {
    const value = this.get('value');
    yield this.get('search')(value);
    yield timeout(DEBOUNCE_TIMEOUT);
  }).restartable(),
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
      this.get('clear')();
    },
    focus(){
      //place focus into the search box when search icon is clicked
      this.$('input[type="search"]').focus();
    },
  }
});
