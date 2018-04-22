/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { hash, all, filter } from 'rsvp';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { computed } from '@ember/object';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

const Validations = buildValidations({
  bestSelectedCourse: [
    validator('presence', true)
  ],
  bestSelectedYear: [
    validator('presence', true)
  ],
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  store: service(),
  flashMessages: service(),
  permissionChecker: service(),
  classNames: ['session-copy'],
  selectedYear: null,
  session: null,
  selectedCourseId: null,

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
    let newCourse = yield this.get('bestSelectedCourse');
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

  years: computed(async function () {
    const now = moment();
    const thisYear = now.year();
    const store = this.get('store');

    let years = await store.findAll('academicYear');
    let academicYears = years.map(year => parseInt(year.get('id'), 10)).filter(year => year >= thisYear - 1).sort();

    return academicYears;
  }),

  bestSelectedYear: computed('years.[]', 'selectedYear', async function () {
    const selectedYear = this.get('selectedYear');
    if (selectedYear) {
      return selectedYear;
    }

    const years = await this.get('years');
    return years.get('firstObject');
  }),

  courses: computed('selectedYear', 'session.course.school', async function(){
    const store = this.get('store');
    const permissionChecker = this.get('permissionChecker');
    const session = this.get('session');
    if (!session) {
      return [];
    }
    const selectedYear = await this.get('bestSelectedYear');
    const course = await session.get('course');
    const school = await course.get('school');
    const courses = await store.query('course', {
      filters: {
        year: selectedYear,
        school: school.get('id')
      }
    });

    const filteredCourses = await filter(courses.toArray(), async course => {
      return !enforceRelationshipCapabilityPermissions || permissionChecker.canCreateSession(course);
    });

    return filteredCourses.sortBy('title');
  }),

  bestSelectedCourse: computed('courses.[]', 'selectedCourseId', async function () {
    const courses = await this.get('courses');
    const selectedCourseId = this.get('selectedCourseId');
    if (selectedCourseId) {
      const course = courses.findBy('id', selectedCourseId);
      if (course) {
        return course;
      }
    }

    return courses.get('firstObject');
  }),

  actions: {
    changeSelectedYear(newYear){
      this.set('selectedCourseId', null);
      this.set('selectedYear', parseInt(newYear, 10));
    },
  }
});
