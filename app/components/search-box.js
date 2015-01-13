import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['search-box'],
  value: null,
  liveSearch: true,
  watchValue: function(){
    if(this.get('liveSearch')){
      this.send('search');
    }
  }.observes('value', 'liveSearch'),
  actions: {
    clear: function() {
      this.set('value', '');
    },
    search: function(){
      if(this.get('value').length === 0){
        this.sendAction('search', '');
      } else {
        Ember.run.debounce(this, function(){
          this.sendAction('search', this.get('value'));
        }, 500);
      }
    },
  }
});
