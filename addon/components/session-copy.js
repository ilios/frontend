import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { hash, all, filter } from 'rsvp';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
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
    const { years, schoolCourses } = yield hash({
      years: this.store.findAll('academicYear'),
      schoolCourses: this.store.query('course', {
        filters: {
          school: school.id,
        },
      }),
    });
    const now = moment();
    const thisYear = now.year();
    this.years = years
      .map((year) => Number(year.id))
      .filter((year) => year >= thisYear - 1)
      .sort();
    this.allCourses = yield filter(schoolCourses.toArray(), async (co) => {
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
        'description',
        'attireRequired',
        'equipmentRequired',
        'supplemental',
        'attendanceRequired',
        'instructionalNotes'
      )
    );

    session.set('course', newCourse);
    session.set('meshDescriptors', (yield sessionToCopy.meshDescriptors).toArray());
    session.set('terms', (yield sessionToCopy.terms).toArray());
    session.set('sessionType', yield sessionToCopy.sessionType);

    const ilmToCopy = yield sessionToCopy.ilmSession;
    if (ilmToCopy) {
      const ilm = this.store.createRecord(
        'ilmSession',
        ilmToCopy.getProperties('hours', 'dueDate')
      );
      ilm.set('session', session);
      toSave.pushObject(ilm);
    }

    const learningMaterialsToCopy = yield sessionToCopy.learningMaterials;
    for (let i = 0; i < learningMaterialsToCopy.length; i++) {
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
    }

    // save the session first to fill out relationships with the session id
    yield session.save();
    yield all(toSave.invoke('save'));

    //parse objectives last because it is a many2many relationship
    //and ember data tries to save it too soon
    const relatedSessionObjectives = yield sessionToCopy.sessionObjectives;
    const sessionObjectivesToCopy = relatedSessionObjectives.sortBy('id').toArray();
    for (let i = 0, n = sessionObjectivesToCopy.length; i < n; i++) {
      const sessionObjectiveToCopy = sessionObjectivesToCopy[i];
      const meshDescriptors = (yield sessionObjectiveToCopy.meshDescriptors).toArray();
      const terms = (yield sessionObjectiveToCopy.terms).toArray();
      const sessionObjective = this.store.createRecord('session-objective', {
        session,
        position: sessionObjectiveToCopy.position,
        title: sessionObjectiveToCopy.title,
      });
      sessionObjective.set('meshDescriptors', meshDescriptors);
      sessionObjective.set('terms', terms);
      yield sessionObjective.save();
    }
    this.flashMessages.success('general.copySuccess');
    return this.args.visit(session);
  }
}
