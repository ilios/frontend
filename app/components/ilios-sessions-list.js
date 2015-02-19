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
    var sessions = this.get('sessions');
    if(sessions == null){
      return Ember.A();
    }
    var filter = this.get('debouncedFilter');
    var filterExpressions = filter.split(' ').map(function(string){
      return new RegExp(string, 'gi');
    });
    var filtered = sessions.filter(function(session) {
      var searchString = session.get('searchString');
      if(searchString === null || searchString === undefined){
        return false;
      }
      var matchedSearchTerms = 0;
      for (var i = 0; i < filterExpressions.length; i++) {
        if(searchString.match(filterExpressions[i])){
          matchedSearchTerms++;
        }
      }
      //if the number of matching search terms is equal to the number searched, return true
      return (matchedSearchTerms === filterExpressions.length);
    });
    return filtered.sortBy('title');
  }.property('sessions.@each.searchString', 'debouncedFilter'),
});
