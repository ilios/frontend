import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  isDirty: false,
  isEditing: false,
  isEditingObserver: function(){
    var objective = this.get('model');
    if(objective && objective.get('isNew') && objective.get('title') == null){
      this.set('isEditing', true);
    }
  }.observes('model').on('init'),
  showFullTitle: false,
  isShortTitle: function(){
    return this.get('shortTitle') !== this.get('title');
  }.property('title', 'shortTitle', 'showFullTitle'),
  bufferedTitle: Ember.computed.oneWay('title'),
  bufferedCompetency: Ember.computed.oneWay('competency'),
  shortTitle: function(){
    var title = this.get('title');
    if(this.get('showFullTitle')){
      return title;
    }
    if(title.length > 300){
      return title.substr(0,300);
    }
    return title;
  }.property('title', 'showFullTitle'),
  competencies: function(){
    return this.get('programYear.competencies');
  }.property('programYear.competencies.@each'),
  actions: {
    showFullTitle: function(){
      this.set('showFullTitle', true);
    },
    edit: function(){
      this.set('isEditing', true);
    },
    doneEditing: function(){
      var bufferedTitle = this.get('bufferedTitle').trim();
      var objective = this.get('model');
      objective.set('title', bufferedTitle);
      objective.set('competency', this.get('bufferedCompetency'));
      this.set('isDirty', true);
      this.set('isEditing', false);
      this.set('programYear.isDirty', true);
    }
  }
});
