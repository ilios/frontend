import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { hash, all, filter } from 'rsvp';
import moment from 'moment';
import { task, timeout } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';
import { computed } from '@ember/object';

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

  years: computed(async function () {
    const now = moment();
    const thisYear = now.year();
    const store = this.get('store');

    const years = await store.findAll('academicYear');
    const academicYears = years.map(year => parseInt(year.get('id'), 10)).filter(year => year >= thisYear - 1).sort();

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

    const filteredCourses = await filter(courses.toArray(), async co => {
      return permissionChecker.canCreateSession(co);
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
  },
  save: task(function * (){
    yield timeout(10);
    this.send('addErrorDisplaysFor', ['selectedCourse', 'selectedYear']);
    const {validations} = yield this.validate();

    if (validations.get('isInvalid')) {
      return;
    }
    const flashMessages = this.get('flashMessages');
    const store = this.get('store');

    const sessionToCopy = this.get('session');
    const newCourse = yield this.get('bestSelectedCourse');
    const toSave = [];

    const session = store.createRecord(
      'session',
      sessionToCopy.getProperties('title', 'attireRequired', 'equipmentRequired', 'supplemental', 'instructionalNotes')
    );
    session.set('course', newCourse);
    const props = yield hash(sessionToCopy.getProperties('meshDescriptors', 'terms', 'sessionType'));
    session.setProperties(props);

    const ilmToCopy = yield sessionToCopy.get('ilmSession');
    if (ilmToCopy) {
      const ilm = store.createRecord('ilmSession', ilmToCopy.getProperties('hours', 'dueDate'));
      ilm.set('session', session);
      toSave.pushObject(ilm);
    }

    const sessionDescriptionToCopy = yield sessionToCopy.get('sessionDescription');
    if (sessionDescriptionToCopy) {
      const sessionDescription = store.createRecord('sessionDescription', sessionDescriptionToCopy.getProperties('description'));
      sessionDescription.set('session', session);
      toSave.pushObject(sessionDescription);
    }

    const learningMaterialsToCopy = yield sessionToCopy.get('learningMaterials');
    for (let i = 0; i < learningMaterialsToCopy.length; i++){
      const learningMaterialToCopy = learningMaterialsToCopy.toArray()[i];
      const lm = yield learningMaterialToCopy.get('learningMaterial');
      const learningMaterial = store.createRecord(
        'sessionLearningMaterial',
        learningMaterialToCopy.getProperties('notes', 'required', 'publicNotes', 'position')
      );
      learningMaterial.set('learningMaterial', lm);
      learningMaterial.set('session', session);
      toSave.pushObject(learningMaterial);
    }

    const originalCourse = yield sessionToCopy.course;
    if (newCourse.id === originalCourse.id) {
      const postrequisiteToCopy = yield sessionToCopy.postrequisite;
      session.set('postrequisite', postrequisiteToCopy);

      const prerequisitesToCopy = yield sessionToCopy.prerequisites;
      session.set('prerequisites', prerequisitesToCopy);
    }

    // save the session first to fill out relationships with the session id
    yield session.save();
    yield all(toSave.invoke('save'));

    //parse objectives last because it is a many2many relationship
    //and ember data tries to save it too soon
    const relatedObjectives = yield sessionToCopy.get('objectives');
    const objectivesToCopy = relatedObjectives.sortBy('id');
    for (let i = 0; i < objectivesToCopy.length; i++){
      const objectiveToCopy = objectivesToCopy.toArray()[i];
      const meshDescriptors = yield objectiveToCopy.get('meshDescriptors');
      const objective = store.createRecord(
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

});
