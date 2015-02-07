import Ember from 'ember';
import LiveSearchItem from 'ilios/mixins/live-search-item';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  keyDown: function(event) {
    if (event.which === 27) {
      this.send('clear');  // ESC key
    }
  },
  placeholder: null,
  buttonTitle: '',
  results: [],
  searchTerms: '',
  minimumTermLength: 2,
  showMoreInputPrompt: false,
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
    this.send('search');
  }.observes('searchTerms'),
  actions: {
    add: function(obj) {
      this.sendAction('add', obj);
      this.send('clear');
    },
    remove: function(obj) {
      this.sendAction('remove', obj);
    },
    search: function(){
      if(this.get('searchTerms').length === 0){
        this.send('clear');
      } else {
        Ember.run.debounce(this, function(){
          if(this.get('searchTerms').length < this.get('minimumTermLength')){
            this.set('showMoreInputPrompt', true);
            this.set('results', []);
          } else {
            this.set('showMoreInputPrompt', false);
            this.sendAction('search', this.get('searchTerms'));
          }
        }, 500);
      }
    },
    clear: function() {
      this.set('results', []);
      this.set('searchTerms', '');
      this.sendAction('search', '');
      this.set('showMoreInputPrompt', false);
      this.$().find('input').focus();
    }
  }
});
