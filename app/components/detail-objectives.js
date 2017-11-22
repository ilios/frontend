import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import scrollTo from '../utils/scroll-to';

const { Promise } = RSVP;
const { or, notEmpty, alias } = computed;

export default Component.extend({
  store: service(),
  i18n: service(),
  flashMessages: service(),
  init() {
    this._super(...arguments);
    this.set('initialStateForManageParentsObjective', []);
    this.set('initialStateForManageMeshObjective', []);
  },
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
  initialStateForManageParentsObjective: null,
  isManagingDescriptors: notEmpty('manageDescriptorsObjective'),
  mangeMeshObjective: null,
  initialStateForManageMeshObjective: null,
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
    manageParents(objective) {
      objective.get('parents').then((parents) => {
        this.set('initialStateForManageParentsObjective', parents.toArray());
        this.set('mangeParentsObjective', objective);
      });
    },
    manageDescriptors(objective) {
      objective.get('meshDescriptors').then((meshDescriptors) => {
        scrollTo(".detail-objectives");
        this.set('initialStateForManageMeshObjective', meshDescriptors.toArray());
        this.set('manageDescriptorsObjective', objective);
      });
    },
    manageCompetency(objective) {
      objective.get('competency').then((competency) => {
        scrollTo(".detail-objectives");
        this.set('initialStateForManageCompetencyObjective', competency);
        this.set('manageCompetencyObjective', objective);
      });
    },
    save() {
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
    cancel() {
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
    saveNewObjective(title) {
      return new Promise(resolve => {
        let newObjective = this.get('store').createRecord('objective');
        let subject = this.get('subject');
        newObjective.set('title', title);
        subject.get('objectives').then(objectives => {
          let position = 0;
          if (! isEmpty(objectives)) {
            position = objectives.toArray().sortBy('position').reverse()[0].get('position') + 1;
          }
          newObjective.set('position', position);
          if(this.get('isCourse')){
            newObjective.get('courses').addObject(subject);
          }
          if(this.get('isSession')){
            newObjective.get('sessions').addObject(subject);
          }
          if(this.get('isProgramYear')){
            newObjective.get('programYears').addObject(subject);
          }
          newObjective.save().then(savedObjective => {
            this.set('newObjectiveEditorOn', false);
            this.get('flashMessages').success('general.newObjectiveSaved');
            resolve(savedObjective);
          });
        });
      });
    },
    toggleNewObjectiveEditor() {
      const expand = this.get('expand');
      //force expand the objective component
      //otherwise adding the first new objective will cause it to close
      expand();
      this.set('newObjectiveEditorOn', !this.get('newObjectiveEditorOn'));
    },
    collapse() {
      const collapse = this.get('collapse');
      this.get('objectives').then(objectives => {
        if(objectives.length){
          collapse();
        }
      });
    },
  }
});
