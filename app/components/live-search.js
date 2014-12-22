import Ember from 'ember';
import LiveSearchItem from 'ilios/mixins/live-search-item';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  classNames: ['inputwithclear'],
  keyDown: function(event) {
    if (event.which === 27) {
      this.send('clear');  // ESC key
    }
  },
  placeholder: null,
  buttonTitle: '',
  results: [],
  searchTerms: '',
  sortedSearchResults: function(){
    return this.get('results').sortBy('sortTerm');
  }.property('results.@each'),
  searchResults: function(key, values){
    if (arguments.length > 1) {
      values.forEach(function(obj){
        if(!LiveSearchItem.detect(obj)){
          throw new Error("You must pass an array of Live Search Items to the search results property.");
        }
      });
      this.set('results', values);
    }
    return this.get('results');
  }.property(),
  watchSeatchTerms: function(){
    //empty search terms should be sent immediatly to reset the filter
    if(this.get('searchTerms').length === 0){
      this.sendAction('search', this.get('searchTerms'));
    }
    Ember.run.debounce(this, function(){
      this.sendAction('search', this.get('searchTerms'));
    }, 500);
  }.observes('searchTerms'),
  actions: {
    add: function(obj) {
      this.send('clear');
      this.sendAction('add', obj);
    },
    remove: function(obj) {
      this.sendAction('remove', obj);
    },
    search: function(){
      this.sendAction('search', this.get('searchTerms'));
    },
    clear: function() {
      this.set('searchTerms', '');
      this.$().find('input').focus();
    }
  }
});
