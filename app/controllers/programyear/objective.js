import Ember from 'ember';
import MeshControllerMixin from '../../mixins/meshcontroller';

export default Ember.ObjectController.extend(MeshControllerMixin, {
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
  bufferedTitle: Ember.computed.oneWay('model.title'),
  bufferedCompetency: Ember.computed.oneWay('model.competency.content'),
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
  availableCompetencies: [],
  availableCompetenciesObserver: function(){
    var self = this;
    if(this.get('programYear.competencies') == null){
      return;
    }
    this.get('programYear.competencies').then(function(competencies){
      var promises = [];
      competencies.forEach(function(competency){
        promises.push(competency.get('children'));
      });
      Ember.RSVP.all(promises).then(function(){
        var availableCompetencies = self.get('programYear.competencies').filter(function(competency){
          if(competency.get('children.length') === 0){
            return true;
          }
          var childSelected = false;
          competency.get('children').forEach(function(child){
            self.get('programYear.competencies').forEach(function(competency2){
              if(competency2.get('id') === child.get('id')){
                childSelected = true;
              }
            });
          });
          return !childSelected;
        });
        availableCompetencies.sort(function(a,b){
          return Ember.compare(a.get('title'),b.get('title'));
        });
        self.set('availableCompetencies', availableCompetencies);
      });
    });
  }.observes('programYear.competencies.@each').on('init'),
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
