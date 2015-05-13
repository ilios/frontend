import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'general.filterPlaceholder',
  filter: '',
  sortBy: ['title'],
  subject: null,
  availableInstructorGroups: [],
  instructorGroups: Ember.computed.alias('subject.instructorGroups'),
  sortedInstructorGroups: Ember.computed.sort('instructorGroups', 'sortBy'),
  filteredAvailableInstructorGroups: function(){
    var self = this;
    var filter = this.get('filter');
    var exp = new RegExp(filter, 'gi');
    var instructorGroups = this.get('availableInstructorGroups')?this.get('availableInstructorGroups'):[];
    return instructorGroups.filter(function(group) {
      return (
        group.get('title') !== undefined &&
        self.get('instructorGroups') &&
        exp.test(group.get('title')) &&
        !self.get('instructorGroups').contains(group)
      );
    }).sortBy('title');
  }.property('instructorGroups.@each', 'filter', 'availableInstructorGroups.@each.title'),
  actions: {
    add: function(instructorGroup){
      var subject = this.get('subject');
      subject.get('instructorGroups').addObject(instructorGroup);
    },
    remove: function(instructorGroup){
      var subject = this.get('subject');
      subject.get('instructorGroups').removeObject(instructorGroup);
    }
  }
});
