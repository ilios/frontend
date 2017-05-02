import Ember from 'ember';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, RSVP, inject, isEmpty } = Ember;
const { service } = inject;
const { hash, all } = RSVP;

const Validations = buildValidations({
  selectedCourse: [
    validator('presence', true)
  ],
  selectedYear: [
    validator('presence', true)
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  flashMessages: service(),
  init(){
    this._super(...arguments);
    this.get('loadYears').perform();
  },
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('loadCourses').perform();
  },
  classNames: ['session-copy'],
  years: [],
  selectedYear: null,
  session: null,
  selectedCourse: null,

  save: task(function * (){
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['selectedCourse', 'selectedYear']);
    let {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      return;
    }
    const flashMessages = this.get('flashMessages');
    const store = this.get('store');

    let sessionToCopy = this.get('session');
    let newCourse = this.get('selectedCourse');
    let toSave = [];

    let session = store.createRecord(
      'session',
      sessionToCopy.getProperties('title', 'attireRequired', 'equipmentRequired', 'supplemental')
    );
    session.set('course', newCourse);
    let props = yield hash(sessionToCopy.getProperties('meshDescriptors', 'terms', 'sessionType'));
    session.setProperties(props);

    let ilmToCopy = yield sessionToCopy.get('ilmSession');
    if (ilmToCopy) {
      let ilm = store.createRecord('ilmSession', ilmToCopy.getProperties('hours', 'dueDate'));
      ilm.set('session', session);
      toSave.pushObject(ilm);
    }

    let sessionDescriptionToCopy = yield sessionToCopy.get('sessionDescription');
    if (sessionDescriptionToCopy) {
      let sessionDescription = store.createRecord('sessionDescription', sessionDescriptionToCopy.getProperties('description'));
      sessionDescription.set('session', session);
      toSave.pushObject(sessionDescription);
    }

    let learningMaterialsToCopy = yield sessionToCopy.get('learningMaterials');
    for (let i = 0; i < learningMaterialsToCopy.length; i++){
      let learningMaterialToCopy = learningMaterialsToCopy.toArray()[i];
      let lm = yield learningMaterialToCopy.get('learningMaterial');
      let learningMaterial = store.createRecord(
        'sessionLearningMaterial',
        learningMaterialToCopy.getProperties('notes', 'required', 'publicNotes', 'position')
      );
      learningMaterial.set('learningMaterial', lm);
      learningMaterial.set('session', session);
      toSave.pushObject(learningMaterial);
    }

    // save the session first to fill out relationships with the session id
    yield session.save();
    yield all(toSave.invoke('save'));

    //parse objectives last because it is a many2many relationship
    //and ember data tries to save it too soon
    let relatedObjectives = yield sessionToCopy.get('objectives');
    let objectivesToCopy = relatedObjectives.sortBy('id');
    for (let i = 0; i < objectivesToCopy.length; i++){
      let objectiveToCopy = objectivesToCopy.toArray()[i];
      let meshDescriptors = yield objectiveToCopy.get('meshDescriptors');
      let objective = store.createRecord(
        'objective',
        objectiveToCopy.getProperties('title', 'position')
      );
      objective.set('meshDescriptors', meshDescriptors);
      objective.set('sessions', [session]);
      //save each objective as it is created to preserve to sequence order of objectives by id
      yield objective.save();
    }
    flashMessages.success('general.copySuccess');
    return this.get('visit')(session);
  }).drop(),

  loadYears: task(function * (){
    const now = moment();
    const thisYear = now.year();
    yield timeout(10);
    const store = this.get('store');

    let years = yield store.findAll('academicYear');
    let academicYears = years.map(year => parseInt(year.get('id'), 10)).filter(year => year >= thisYear - 1).sort();

    if (isEmpty(this.get('selectedYear'))) {
      this.set('selectedYear', academicYears.get('firstObject'));
    }

    return academicYears;
  }).drop(),

  loadCourses: task(function * (){
    yield timeout(10);
    while (this.get('loadYears').get('isRunning')) {
      yield timeout(10);
    }
    const store = this.get('store');
    const year = this.get('selectedYear');
    const session = this.get('session');
    if (!session) {
      return [];
    }
    const school = yield session.get('course').get('school').get('id');
    let courses = yield store.query('course', {
      filters: {
        year,
        school
      },
      limit: 10000
    });

    if (isEmpty(this.get('selectedCourse'))) {
      this.set('selectedCourse', courses.sortBy('title').get('firstObject'));
    }

    return courses;
  }).restartable(),

  actions: {
    changeSelectedYear(newYear){
      this.set('selectedCourse', null);
      this.set('selectedYear', newYear);
      this.get('loadCourses').perform();
    },
    changeSelectedCourse(id){
      let courses = this.get('loadCourses.lastSuccessful.value');
      let course = courses.findBy('id', id);

      this.set('selectedCourse', course);
    }
  }
});
