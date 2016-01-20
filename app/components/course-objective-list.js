import Ember from 'ember';

const { computed, Component, ObjectProxy } = Ember;
const { sort, alias } = computed;

export default Component.extend({
  course: null,
  editable: true,
  objectives: alias('course.objectives'),
  proxiedObjectives: computed('objectives.[]', function(){
    return this.get('objectives').map(objective => {
      return ObjectProxy.create({
        content: objective,
        showRemoveConfirmation: false
      });
    });
  }),
  sortedObjectives: sort('proxiedObjectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
  classNames: ['course-objective-list'],
  toRemove: [],
  actions: {
    manageParents(objective){
      this.sendAction('manageParents', objective);
    },
    manageDescriptors(objective){
      this.sendAction('manageDescriptors', objective);
    },
    changeObjectiveTitle(value, id){
      var objective = this.get('objectives').findBy('id', id);
      if(objective){
        objective.set('title', value);
        objective.save();
      }
    },
    confirmRemoval(objectiveProxy){
      objectiveProxy.set('showRemoveConfirmation', true);
    },
    remove(objectiveProxy){
      let objective = objectiveProxy.get('content');
      objective.deleteRecord();
      objective.save();
    },
    cancelRemove(objectiveProxy){
      objectiveProxy.set('showRemoveConfirmation', false);
    }
  }
});
