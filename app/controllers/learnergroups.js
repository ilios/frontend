import Ember from 'ember';

export default Ember.Controller.extend({
  breadCrumb: function(){
    var crumb = Ember.I18n.t('navigation.learnerGroups');
    if(this.get('currentUser.currentCohort') != null){
      crumb =  this.get('currentUser.currentCohort.displayTitle') + ' ' + crumb;
    }
    return crumb;
  }.property('currentUser.currentCohort.displayTitle'),
});
