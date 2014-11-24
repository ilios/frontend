import Ember from 'ember';

export default Ember.Component.extend({
  filter: '',
  filteredContent: function(){
    var filter = this.get('filter');
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
  }.property('sessions.@each.title', 'filter'),
});
