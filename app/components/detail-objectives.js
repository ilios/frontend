import Ember from 'ember';
import scrollTo from '../utils/scroll-to';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { or, notEmpty, alias } = computed;

export default Component.extend({
  store: service(),
  i18n: service(),
  flashMessages: service(),
  subject: null,
  objectives:  alias('subject.objectives'),
  tagName: 'section',
  classNameBindings: [':detail-objectives', 'showCollapsible:collapsible'],
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  editable: true,
  isManaging: or('isManagingParents', 'isManagingDescriptors', 'isManagingCompetency'),
  isManagingParents: notEmpty('mangeParentsObjective'),
  mangeParentsObjective: null,
  initialStateForManageParentsObjective: [],
  isManagingDescriptors: notEmpty('manageDescriptorsObjective'),
  mangeMeshObjective: null,
  initialStateForManageMeshObjective: [],
  isManagingCompetency: notEmpty('manageCompetencyObjective'),
  manageCompetencyObjective: null,
  initialStateForManageCompetencyObjective: null,
  newObjectiveEditorOn: false,
  newObjectiveTitle: null,

  showCollapsible: computed('isManaging', 'objectives', function(){
    const isManaging = this.get('isManaging');
    const objectives = this.get('objectives');
    return objectives.get('length') && ! isManaging;
  }),

  objectiveParentTitle: computed('isCourse', 'isSession', 'isProgramYear', {
    get() {
      const i18n = this.get('i18n');
      const isCourse = this.get('isCourse');

      return isCourse ? i18n.t('general.objectiveParentTitleSingular') : i18n.t('general.objectiveParentTitle');
    }
  }),

  actions: {
    manageParents: function(objective){
      objective.get('parents').then((parents) => {
        this.set('initialStateForManageParentsObjective', parents.toArray());
        this.set('mangeParentsObjective', objective);
      });
    },
    manageDescriptors: function(objective){
      objective.get('meshDescriptors').then((meshDescriptors) => {
        scrollTo(".detail-objectives");
        this.set('initialStateForManageMeshObjective', meshDescriptors.toArray());
        this.set('manageDescriptorsObjective', objective);
      });
    },
    manageCompetency: function(objective){
      objective.get('competency').then((competency) => {
        scrollTo(".detail-objectives");
        this.set('initialStateForManageCompetencyObjective', competency);
        this.set('manageCompetencyObjective', objective);
      });
    },
    save: function(){
      if(this.get('isManagingParents')){
        let objective = this.get('mangeParentsObjective');
        objective.get('parents').then(newParents => {
          let oldParents = this.get('initialStateForManageParentsObjective').filter(parent => {
            return !newParents.includes(parent);
          });
          oldParents.forEach(parent => {
            parent.get('children').removeObject(objective);
          });
          objective.save().then(() => {
            this.set('mangeParentsObjective', null);
            scrollTo("#objective-" + objective.get('id'));
          });
        });
      }
      if(this.get('isManagingDescriptors')){
        let objective = this.get('manageDescriptorsObjective');
        objective.get('meshDescriptors').then(newDescriptors => {
          let oldDescriptors = this.get('initialStateForManageMeshObjective').filter(descriptor => {
            return !newDescriptors.includes(descriptor);
          });
          oldDescriptors.forEach(descriptor => {
            descriptor.get('objectives').removeObject(objective);
          });
          newDescriptors.forEach(descriptor => {
            descriptor.get('objectives').addObject(objective);
          });
          objective.save().then(() => {
            this.set('manageDescriptorsObjective', null);
            scrollTo("#objective-" + objective.get('id'));
          });
        });
      }
      if(this.get('isManagingCompetency')){
        let objective = this.get('manageCompetencyObjective');
        objective.get('competency').then(newCompetency => {
          let oldCompetency = this.get('initialStateForManageCompetencyObjective');
          if(oldCompetency){
            oldCompetency.get('objectives').removeObject(objective);
          }
          if(newCompetency){
            newCompetency.get('objectives').addObject(objective);
          }
          objective.save().then(() => {
            this.set('manageCompetencyObjective', null);
            scrollTo("#objective-" + objective.get('id'));
          });
        });
      }
    },
    cancel: function(){
      var self = this;
      if(this.get('isManagingParents')){
        let objective = this.get('mangeParentsObjective');
        let parents = objective.get('parents');
        parents.clear();
        parents.addObjects(this.get('initialStateForManageParentsObjective'));
        self.set('mangeParentsObjective', null);
      }

      if(this.get('isManagingDescriptors')){
        let objective = this.get('manageDescriptorsObjective');
        let descriptors = objective.get('meshDescriptors');
        descriptors.clear();
        descriptors.addObjects(this.get('initialStateForManageMeshObjective'));
        self.set('manageDescriptorsObjective', null);
        scrollTo("#objective-" + objective.get('id'));
      }

      if(this.get('isManagingCompetency')){
        let objective = this.get('manageCompetencyObjective');
        objective.set('competency', this.get('initialStateForManageCompetencyObjective'));
        self.set('manageCompetencyObjective', null);
        scrollTo("#objective-" + objective.get('id'));
      }
    },
    saveNewObjective: function(title){
      let newObjective = this.get('store').createRecord('objective');
      newObjective.set('title', title);
      newObjective.set('position', 0);
      if(this.get('isCourse')){
        newObjective.get('courses').addObject(this.get('subject'));
      }
      if(this.get('isSession')){
        newObjective.get('sessions').addObject(this.get('subject'));
      }
      if(this.get('isProgramYear')){
        newObjective.get('programYears').addObject(this.get('subject'));
      }
      return newObjective.save().then(() => {
        this.set('newObjectiveEditorOn', false);
        this.get('flashMessages').success('general.newObjectiveSaved');
      });
    },
    toggleNewObjectiveEditor() {
      //force expand the objective component
      //otherwise adding the first new objective will cause it to close
      this.attrs.expand();
      this.set('newObjectiveEditorOn', !this.get('newObjectiveEditorOn'));
    },
    collapse(){
      this.get('objectives').then(objectives => {
        if(objectives.length){
          this.attrs.collapse();
        }
      });
    },
  }
});
