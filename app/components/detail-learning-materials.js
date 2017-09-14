import Ember from 'ember';

const { isEmpty, Component, computed, inject, RSVP } = Ember;
const { notEmpty, or, not } = computed;
const { service } = inject;
const { all, map } = RSVP;

export default Component.extend({
  currentUser: service(),
  store: service(),
  i18n: service(),
  tagName: 'section',
  classNameBindings: [':detail-learningmaterials', 'displaySearchBox'],
  subject: null,
  isCourse: false,
  editable: true,
  isSorting: false,
  isSaving: false,
  isManaging: or('isManagingMaterial', 'isManagingMesh'),
  isManagingMaterial: notEmpty('managingMaterial'),
  isManagingMesh: notEmpty('meshMaterial'),
  managingMaterial: null,
  meshMaterial: null,
  isSession: not('isCourse'),
  bufferTerms: [],
  totalMaterialsToSave: null,
  currentMaterialsSaved: null,

  isEditing: false,
  type: null,

  displaySearchBox: computed('isManaging', 'isEditing', 'isSorting', function(){
    const isManaging = this.get('isManaging');
    const isEditing = this.get('isEditing');
    const editable = this.get('editable');
    const isSorting = this.get('isSorting');

    return (!isManaging && !isEditing && !isSorting && editable);
  }),

  parentMaterials: computed('subject.learningMaterials.[]', async function () {
    const subLms = await this.get('subject.learningMaterials');
    const learningMaterials = map(subLms.toArray(), async subjectMaterial => {
      return await subjectMaterial.get('learningMaterial');
    });

    return learningMaterials;
  }),

  hasMoreThanOneLearningMaterial: computed('subject.learningMaterials.[]', async function () {
    const subject = this.get('subject');
    const learningMaterials = await subject.get('learningMaterials');

    return learningMaterials.length > 1;
  }),

  saveSomeMaterials(arr){
    let chunk = arr.splice(0, 5);
    return all(chunk.invoke('save')).then(() => {
      if (arr.length){
        this.set('currentMaterialsSaved', this.get('currentMaterialsSaved') + chunk.length);
        return this.saveSomeMaterials(arr);
      }
    });
  },
  learningMaterialStatuses: computed(async function () {
    const store = this.get('store');
    return await store.findAll('learning-material-status');
  }),

  actions: {
    async manageMaterial(learningMaterial){
      this.set('managingMaterial', learningMaterial);
    },
    async manageDescriptors(learningMaterial) {
      const descriptors = await learningMaterial.get('meshDescriptors');
      this.set('bufferTerms', descriptors.toArray());
      this.set('meshMaterial', learningMaterial);
    },
    save(){
      if(this.get('isManagingMesh')){
        let lm = this.get('meshMaterial');
        let terms = lm .get('meshDescriptors');
        let promises = [];

        let oldTerms = terms.filter(term => {
          return !this.get('bufferTerms').includes(term);
        });
        terms.clear();
        terms.addObjects(this.get('bufferTerms'));
        this.get('bufferTerms').forEach((term)=>{
          if(this.get('isCourse')){
            term.get('courseLearningMaterials').pushObject(lm);
          }
          if(this.get('isSession')){
            term.get('sessionLearningMaterials').pushObject(lm);
          }
        });
        oldTerms.forEach(term => {
          if(this.get('isCourse')){
            term.get('courseLearningMaterials').removeObject(lm);
          }
          if(this.get('isSession')){
            term.get('sessionLearningMaterials').removeObject(lm);
          }
        });
        promises.pushObject(lm.save());
        all(promises).then(()=> {
          this.set('meshMaterial', null);
          this.set('bufferTerms', []);
        });
      }
    },

    addNewLearningMaterial(type){
      this.setProperties({ type, isEditing: true });
    },

    async saveNewLearningMaterial(lm) {
      const store = this.get('store');
      const isCourse = this.get('isCourse');
      const subject = this.get('subject');
      const savedLm = await lm.save();
      const learningMaterials = await subject.get('learningMaterials');

      let lmSubject;
      let position = 0;
      if (! isEmpty(learningMaterials)) {
        position = learningMaterials.toArray().sortBy('position').reverse()[0].get('position') + 1;
      }
      if (isCourse) {
        lmSubject = store.createRecord('course-learning-material', { course: subject, position });
      } else {
        lmSubject = store.createRecord('session-learning-material', { session: subject, position });
      }
      lmSubject.set('learningMaterial', savedLm);
      await lmSubject.save();
      this.set('isEditing', false);
    },

    saveSortOrder(learningMaterials){
      this.set('isSaving', true);
      for (let i = 0, n = learningMaterials.length; i < n; i++) {
        let lm = learningMaterials[i];
        lm.set('position', i + 1);
      }
      this.set('totalMaterialsToSave', learningMaterials.length);
      this.set('currentMaterialsSaved', 0);

      this.saveSomeMaterials(learningMaterials).then(() => {
        this.set('isSaving', false);
        this.set('isSorting', false);
      });
    },

    cancelSorting() {
      this.set('isSorting', false);
    },

    cancelNewLearningMaterial() {
      this.set('isEditing', false);
    },

    addTermToBuffer(term){
      this.get('bufferTerms').addObject(term);
    },
    removeTermFromBuffer(term){
      this.get('bufferTerms').removeObject(term);
    },
    async addLearningMaterial(parentLearningMaterial) {
      const store = this.get('store');
      let newLearningMaterial;
      let lmCollectionType;
      let subject = this.get('subject');

      if(this.get('isCourse')){
        newLearningMaterial = store.createRecord('course-learning-material', {
          course: subject,
          learningMaterial: parentLearningMaterial,
          position: 0,
        });
        lmCollectionType = 'courseLearningMaterials';

      }
      if(this.get('isSession')){
        newLearningMaterial = store.createRecord('session-learning-material', {
          session: subject,
          learningMaterial: parentLearningMaterial,
          position: 0
        });
        lmCollectionType = 'sessionLearningMaterials';
      }
      const learningMaterials = await subject.get('learningMaterials');
      let position = 0;
      if (learningMaterials.length > 1) {
        position = learningMaterials.toArray().sortBy('position').reverse()[0].get('position') + 1;
      }
      newLearningMaterial.set('position', position);
      const savedLearningMaterial = await newLearningMaterial.save();
      const children = await parentLearningMaterial.get(lmCollectionType);
      children.pushObject(savedLearningMaterial);

      return savedLearningMaterial;
    },
    async remove(subjectLearningMaterial){
      subjectLearningMaterial.deleteRecord();
      return subjectLearningMaterial.save();
    },
  }
});
