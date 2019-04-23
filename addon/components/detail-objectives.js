import { inject as service } from '@ember/service';
import layout from '../templates/components/detail-objectives';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { Promise as RSVPPromise } from 'rsvp';
import scrollTo from 'ilios-common/utils/scroll-to';

const { or, notEmpty, alias } = computed;

export default Component.extend({
  store: service(),
  intl: service(),
  flashMessages: service(),
  layout,
  subject: null,
  tagName: 'section',
  classNameBindings: [':detail-objectives', 'showCollapsible:collapsible'],
  isCourse: false,
  isSession: false,
  isProgramYear: false,
  editable: true,
  mangeParentsObjective: null,
  initialStateForManageParentsObjective: null,
  mangeMeshObjective: null,
  initialStateForManageMeshObjective: null,
  manageCompetencyObjective: null,
  initialStateForManageCompetencyObjective: null,
  newObjectiveEditorOn: false,
  newObjectiveTitle: null,
  'data-test-detail-objectives': true,

  objectives:  alias('subject.objectives'),
  isManaging: or('isManagingParents', 'isManagingDescriptors', 'isManagingCompetency'),
  isManagingParents: notEmpty('mangeParentsObjective'),
  isManagingDescriptors: notEmpty('manageDescriptorsObjective'),
  isManagingCompetency: notEmpty('manageCompetencyObjective'),
  showCollapsible: computed('isManaging', 'objectives', function(){
    const isManaging = this.get('isManaging');
    const objectives = this.get('objectives');
    return objectives.get('length') && ! isManaging;
  }),

  objectiveParentTitle: computed('isCourse', 'isSession', 'isProgramYear', {
    get() {
      const intl = this.get('intl');
      const isCourse = this.get('isCourse');

      return isCourse ? intl.t('general.objectiveParentTitleSingular') : intl.t('general.objectiveParentTitle');
    }
  }),

  init() {
    this._super(...arguments);
    this.set('initialStateForManageParentsObjective', []);
    this.set('initialStateForManageMeshObjective', []);
  },
  actions: {
    manageParents(objective) {
      objective.get('parents').then((parents) => {
        this.set('initialStateForManageParentsObjective', parents.toArray());
        this.set('mangeParentsObjective', objective);
      });
    },
    manageDescriptors(objective) {
      objective.get('meshDescriptors').then((meshDescriptors) => {
        scrollTo('.detail-objectives', 1000);
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
      return new RSVPPromise(resolve => {
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
