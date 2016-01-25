import Ember from 'ember';
import scrollTo from '../utils/scroll-to';
import config from 'ilios/config/environment';

const { Component, computed, inject } = Ember;
const { service } = inject;
const { or, notEmpty } = computed;

export default Component.extend({
  store: service(),
  i18n: service(),
  flashMessages: service(),
  subject: null,
  classNames: ['detail-objectives'],
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
  editorParams: config.froalaEditorDefaults,

  objectiveParentTitle: computed('isCourse', 'isSession', 'isProgramYear', {
    get() {
      const i18n = this.get('i18n');
      const isCourse = this.get('isCourse');

      return isCourse ? i18n.t('courses.objectiveParentTitleSingular') : i18n.t('courses.objectiveParentTitle');
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
    mangeCompetency: function(objective){
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
            return !newParents.contains(parent);
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
            return !newDescriptors.contains(descriptor);
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
    saveNewObjective: function(){
      let newObjective = this.get('store').createRecord('objective');
      newObjective.set('title', this.get('newObjectiveTitle'));
      if(this.get('isCourse')){
        newObjective.get('courses').addObject(this.get('subject'));
      }
      if(this.get('isSession')){
        newObjective.get('sessions').addObject(this.get('subject'));
      }
      if(this.get('isProgramYear')){
        newObjective.get('programYears').addObject(this.get('subject'));
      }
      newObjective.save().then(savedObjective => {
        this.get('subject.objectives').then(objectives => {
          objectives.addObject(savedObjective);
        });
        this.send('closeNewObjectiveEditor');
        this.get('flashMessages').success('courses.newObjectiveSaved');
      });
    },
    toggleNewObjectiveEditor() {
      this.set('newObjectiveTitle', null);
      this.set('newObjectiveEditorOn', !this.get('newObjectiveEditorOn'));
    },
    closeNewObjectiveEditor() {
      this.set('newObjectiveTitle', null);
      this.set('newObjectiveEditorOn', false);
    },
    changeNewObjectiveTitle(event, editor){
      if(editor){
        this.set('newObjectiveTitle', editor.getHTML());
      }
    },
  }
});
