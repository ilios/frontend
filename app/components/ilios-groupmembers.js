import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  title: '',
  userFilter: '',
  searchTerms: '',
  showResults: false,
  filteredUsers: function(){
    var filter = this.get('userFilter');
    var exp = new RegExp(filter, 'gi');
    var users = this.get('users');

    var filtered = users.filter(function(user) {
      return user.get('fullName').match(exp) || user.get('email').match(exp);
    });
    return filtered.sortBy('lastName', 'firstName');
  }.property('users.@each', 'userFilter'),
  actions: {
    add: function(user) {
      this.sendAction('add', user);
    },
    remove: function(user) {
      this.sendAction('remove', user);
    },
    search: function(){
      this.sendAction('search', this.get('searchTerms'));
      this.set('showResults', true);
    },
  }
});
