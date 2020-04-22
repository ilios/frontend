import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { hash, all, filter } from 'rsvp';
import { timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import moment from 'moment';

export default class SessionCopyComponent extends Component {
  @service store;
  @service flashMessages;
  @service permissionChecker;

  @tracked selectedYear;
  @tracked selectedCourseId;
  @tracked years;
  @tracked allCourses;

  @restartableTask
  *setup(element, [session]) {
    if (!session) {
      return;
    }
    const course = yield session.course;
    const school = yield course.school;
    const {
      years,
      schoolCourses
    } = yield hash({
      years: this.store.findAll('academicYear'),
      schoolCourses: this.store.query('course', {
        filters: {
          school: school.id
        }
      })
    });
    const now = moment();
    const thisYear = now.year();
    this.years = years.map(year => Number(year.id)).filter(year => year >= thisYear - 1).sort();
    this.allCourses = yield filter(schoolCourses.toArray(), async co => {
      return this.permissionChecker.canCreateSession(co);
    });
  }

  get bestSelectedYear() {
    if (this.selectedYear) {
      return this.selectedYear;
    }

    return this.years.get('firstObject');
  }

  get courses() {
    if (!this.allCourses) {
      return null;
    }
    return this.allCourses.filterBy('year', this.bestSelectedYear).sortBy('title');
  }

  get bestSelectedCourse() {
    if (this.selectedCourseId) {
      const course = this.courses.findBy('id', this.selectedCourseId);
      if (course) {
        return course;
      }
    }

    return this.courses.get('firstObject');
  }

  @action
  changeSelectedYear(event) {
    this.selectedCourseId = null;
    this.selectedYear = Number(event.target.value);
  }

  @action
  changeSelectedCourseId(event) {
    this.selectedCourseId = event.target.value;
  }

  @dropTask
  *save() {
    yield timeout(10);
    const sessionToCopy = this.args.session;
    const newCourse = this.bestSelectedCourse;
    const toSave = [];

    const session = this.store.createRecord(
      'session',
      sessionToCopy.getProperties(
        'title',
        'attireRequired',
        'equipmentRequired',
        'supplemental',
        'attendanceRequired',
        'instructionalNotes'
      )
    );

    session.set('course', newCourse);
    const props = yield hash(sessionToCopy.getProperties('meshDescriptors', 'terms', 'sessionType'));
    session.setProperties(props);

    const ilmToCopy = yield sessionToCopy.ilmSession;
    if (ilmToCopy) {
      const ilm = this.store.createRecord('ilmSession', ilmToCopy.getProperties('hours', 'dueDate'));
      ilm.set('session', session);
      toSave.pushObject(ilm);
    }

    const sessionDescriptionToCopy = yield sessionToCopy.sessionDescription;
    if (sessionDescriptionToCopy) {
      const sessionDescription = this.store.createRecord('sessionDescription', sessionDescriptionToCopy.getProperties('description'));
      sessionDescription.set('session', session);
      toSave.pushObject(sessionDescription);
    }

    const learningMaterialsToCopy = yield sessionToCopy.learningMaterials;
    for (let i = 0; i < learningMaterialsToCopy.length; i++){
      const learningMaterialToCopy = learningMaterialsToCopy.toArray()[i];
      const lm = yield learningMaterialToCopy.learningMaterial;
      const learningMaterial = this.store.createRecord(
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
    const relatedObjectives = yield sessionToCopy.objectives;
    const objectivesToCopy = relatedObjectives.sortBy('id');
    for (let i = 0; i < objectivesToCopy.length; i++){
      const objectiveToCopy = objectivesToCopy.toArray()[i];
      const meshDescriptors = yield objectiveToCopy.meshDescriptors;
      const objective = this.store.createRecord(
        'objective',
        objectiveToCopy.getProperties('title', 'position')
      );
      objective.set('meshDescriptors', meshDescriptors);
      objective.set('sessions', [session]);
      //save each objective as it is created to preserve to sequence order of objectives by id
      yield objective.save();
    }
    this.flashMessages.success('general.copySuccess');
    return this.args.visit(session);
  }
}
