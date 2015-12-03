import Ember from 'ember';

const { Component, observer } = Ember;

export default Component.extend({
  classNames: ['search-box'],
  value: null,
  liveSearch: true,
  watchValue: observer('value', 'liveSearch', function(){
    if(this.get('liveSearch')){
      this.send('search');
    }
  }),
  actions: {
    clear: function() {
      this.set('value', '');
      this.sendAction('clear');
    },
    search: function(){
      //place focus into the search box when search icon is clicked
      this.$('input[type="search"]').focus();
      if(this.get('value').length === 0 || !this.get('liveSearch')){
        this.sendAction('search', this.get('value'));
      } else {
        Ember.run.debounce(this, function(){
          this.sendAction('search', this.get('value'));
        }, 1000);
      }
    },
  }
});
