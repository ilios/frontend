import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  breadCrumbTranslation: 'learnerGroups.selectCohort',
  sortAscending: true,
  filter: '',
  sortProperties: ['displayTitle'],
  filteredContent: function(){
    var filter = this.get('filter');
    var exp = new RegExp(filter, 'gi');
    var groups = this.get('arrangedContent');
    if(groups == null){
      return Ember.A();
    }
    return groups.filter(function(group) {
      return group.get('displayTitle').match(exp);
    });

  }.property('arrangedContent.@each', 'filter'),
});
