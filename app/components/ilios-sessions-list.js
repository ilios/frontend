import Ember from 'ember';

export default Ember.Component.extend({
  filter: '',

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: '',
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('filter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('filter'));
  },
  filteredContent: function(){
    var filter = this.get('debouncedFilter');
    var exp = new RegExp(filter, 'gi');
    var sessions = this.get('sessions');
    if(sessions == null){
      return Ember.A();
    }
    var filtered = sessions.filter(function(session) {
      var title = session.get('title');
      if(title === null || title === undefined){
        return false;
      }
      return title.match(exp);
    });
    return filtered.sortBy('title');
  }.property('sessions.@each.title', 'debouncedFilter'),
});
