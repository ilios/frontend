import Ember from 'ember';
import LiveSearchItem from 'ilios/mixins/live-search-item';

const { Component, computed, observer } = Ember;

export default Component.extend({
  keyDown: function(event) {
    if (event.which === 27) {
      this.send('clear');  // ESC key
    }
  },
  placeholder: null,
  buttonTitle: '',
  results: [],
  searchTerms: '',
  minimumTermLength: 3,
  showMoreInputPrompt: false,
  searchReturned: false,
  searching: false,
  sortedSearchResults: computed('results.@each', function(){
    return this.get('results').sortBy('sortTerm');
  }),

  searchResults: computed(function(key, values){
    if (arguments.length > 1) {
      values.forEach(function(obj){
        if(!LiveSearchItem.detect(obj)){
          throw new Error("You must pass an array of Live Search Items to the search results property.");
        }
      });
      this.set('results', values);
    }
    return this.get('results');
  }),

  watchSeatchTerms: observer('searchTerms', function(){
    this.send('search');
  }),
  actions: {
    add: function(obj) {
      this.sendAction('add', obj);
      this.send('clear');
    },
    remove: function(obj) {
      this.sendAction('remove', obj);
    },
    search: function(){
      var length = this.get('searchTerms').replace(/ /g,'').length;
      if(length === 0){
        this.send('clear');
      } else {
        if(length < this.get('minimumTermLength')){
          this.set('showMoreInputPrompt', true);
          this.set('searching', false);
          this.set('results', []);
        } else {
          this.set('showMoreInputPrompt', false);
          this.sendAction('search', this.get('searchTerms'));
        }
      }
    },
    clear: function() {
      this.set('results', []);
      this.set('searchTerms', '');
      this.sendAction('search', '');
      this.set('showMoreInputPrompt', false);
      this.set('searching', false);
      this.$().find('input').focus();
    }
  }
});
