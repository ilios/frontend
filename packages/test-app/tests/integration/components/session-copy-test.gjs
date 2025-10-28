import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click, find, fillIn } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { findById } from 'ilios-common/utils/array-helpers';
import SessionCopy from 'ilios-common/components/session-copy';

module('Integration | Component | session copy', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders', async function (assert) {
    const now = DateTime.fromObject({ hour: 8 });
    const thisYear = now.year;
    const lastYear = thisYear - 1;
    const nextYear = thisYear + 1;

    [lastYear, thisYear, nextYear].forEach((year) => {
      this.server.create('academic-year', {
        id: year,
      });
    });
    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course 1',
      year: lastYear,
      school,
    });

    const course2 = this.server.create('course', {
      title: 'old course 2',
      year: lastYear,
      school,
    });

    const session = this.server.create('session', {
      title: 'old session',
      course,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);

    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(<template><SessionCopy @session={{this.session}} /></template>);

    const yearSelect = '.year-select select';
    const courseSelect = '.course-select select';
    const save = '.done';

    assert.dom(`${yearSelect} option`).exists({ count: 3 });
    for (let i = 1; i <= 2; i++) {
      assert
        .dom(`${yearSelect} option:nth-of-type(${i})`)
        .hasText(`${lastYear + i - 1} - ${lastYear + i}`);
    }
    assert.dom(`${courseSelect} option`).exists({ count: 2 });
    assert.dom(`${courseSelect} option:nth-of-type(1)`).hasText(course.title);
    assert.dom(`${courseSelect} option:nth-of-type(2)`).hasText(course2.title);
    assert.notOk(find(save).enabled);
  });

  test('copy session', async function (assert) {
    const thisYear = DateTime.now().year;
    this.server.create('academic-year', {
      id: thisYear,
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      year: thisYear,
      school,
    });
    const learningMaterial = this.server.create('learning-material');
    const sessionLearningMaterial = this.server.create('session-learning-material', {
      notes: 'some notes',
      required: false,
      publicNotes: true,
      learningMaterial,
      position: 3,
    });
    const meshDescriptor = this.server.create('mesh-descriptor');
    const term = this.server.create('term');
    const sessionType = this.server.create('session-type');

    const session = this.server.create('session', {
      title: 'old session',
      description: 'test description',
      course,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      attendanceRequired: true,
      instructionalNotes: 'old session notes',
      sessionType,
      meshDescriptors: [meshDescriptor],
      terms: [term],
      learningMaterials: [sessionLearningMaterial],
    });

    const courseObjective = this.server.create('course-objective');
    const objectiveTerm = this.server.create('term');
    const sessionObjective = this.server.create('session-objective', {
      session,
      title: 'session objective title',
      courseObjectives: [courseObjective],
      terms: [objectiveTerm],
      position: 3,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newSession.id, 10), 2);
    });
    await render(
      <template><SessionCopy @session={{this.session}} @visit={{this.visit}} /></template>,
    );

    await click('.done');

    const sessions = await this.store.findAll('session');
    assert.strictEqual(sessions.length, 2);
    const newSession = findById(sessions, '2');
    assert.strictEqual(session.attireRequired, newSession.attireRequired);
    assert.strictEqual(session.equipmentRequired, newSession.equipmentRequired);
    assert.strictEqual(session.supplemental, newSession.supplemental);
    assert.strictEqual(session.attendanceRequired, newSession.attendanceRequired);
    assert.strictEqual(session.title, newSession.title);
    assert.strictEqual(session.description, newSession.description);
    assert.strictEqual(session.instructionalNotes, newSession.instructionalNotes);

    const sessionLearningMaterials = await this.owner
      .lookup('service:store')
      .findAll('session-learning-material');
    assert.strictEqual(sessionLearningMaterials.length, 2);
    const newSessionLm = findById(sessionLearningMaterials, '2');
    assert.strictEqual(sessionLearningMaterial.notes, newSessionLm.notes);
    assert.strictEqual(sessionLearningMaterial.required, newSessionLm.required);
    assert.strictEqual(sessionLearningMaterial.publicNotes, newSessionLm.publicNotes);
    assert.strictEqual(sessionLearningMaterial.position, newSessionLm.position);
    assert.strictEqual(newSessionLm.belongsTo('session').id(), newSession.id);
    assert.strictEqual(newSessionLm.belongsTo('learningMaterial').id(), learningMaterial.id);

    const sessionObjectives = await this.store.findAll('session-objective');
    assert.strictEqual(sessionObjectives.length, 2);
    const newSessionObjective = findById(sessionObjectives, '2');
    assert.strictEqual(newSessionObjective.title, sessionObjective.title);
    assert.strictEqual(sessionObjective.position, newSessionObjective.position);
    assert.strictEqual(newSessionObjective.belongsTo('session').id(), newSession.id);
    const objectiveTermModel = await this.owner
      .lookup('service:store')
      .findRecord('term', objectiveTerm.id);
    const copiedSessionObjectiveTerms = await newSessionObjective.terms;
    assert.strictEqual(copiedSessionObjectiveTerms.length, 1);
    assert.ok(copiedSessionObjectiveTerms.includes(objectiveTermModel));
    assert.verifySteps(['visit called']);
  });

  test('save cannot be clicked when there is no year or course', async function (assert) {
    this.server.create('academic-year', { id: 2013 });
    this.server.create('academic-year', { id: 2012 });
    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
    });
    const sessionType = this.server.create('session-type');

    const session = this.server.create('session', {
      course,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      attendanceRequired: true,
      sessionType,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);

    await render(<template><SessionCopy @session={{this.session}} /></template>);
    await fillIn('.year-select select', 2012);
    assert.dom('[data-test-save]').isDisabled();
    await fillIn('.year-select select', 2013);
    assert.dom('[data-test-save]').isNotDisabled();
  });

  test('changing the year looks for new matching courses', async function (assert) {
    const thisYear = DateTime.now().year;
    const nextYear = thisYear + 1;
    this.server.create('academic-year', {
      id: thisYear,
    });
    this.server.create('academic-year', {
      id: nextYear,
    });

    const school = this.server.create('school');
    const course1 = this.server.create('course', {
      school,
      year: thisYear,
    });
    const course2 = this.server.create('course', {
      school,
      year: nextYear,
    });

    const sessionType = this.server.create('session-type');

    const session = this.server.create('session', {
      course: course1,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      attendanceRequired: true,
      sessionType,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    await render(<template><SessionCopy @session={{this.session}} /></template>);
    const yearSelect = '.year-select select';
    const courseSelect = '.course-select select';

    assert.dom(yearSelect).hasValue(`${thisYear}`);
    assert.dom(`${courseSelect} option`).exists({ count: 1 });
    assert.dom(`${courseSelect} option:nth-of-type(1)`).hasText(course1.title);

    await fillIn(yearSelect, nextYear);
    assert.dom(`${courseSelect} option`).exists({ count: 1 });
    assert.dom(`${courseSelect} option:nth-of-type(1)`).hasText(course2.title);
  });

  test('copy session into the first course in a different year #2130', async function (assert) {
    const thisYear = DateTime.now().year;
    const nextYear = thisYear + 1;
    this.server.create('academic-year', {
      id: thisYear,
    });
    this.server.create('academic-year', {
      id: nextYear,
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      school,
      year: thisYear,
    });
    this.server.create('course', {
      school,
      year: nextYear,
    });
    const course3 = this.server.create('course', {
      school,
      title: 'alpha first',
      year: nextYear,
    });

    const sessionType = this.server.create('session-type');

    const session = this.server.create('session', {
      course,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      attendanceRequired: true,
      sessionType,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newSession.id, 10), 2);
    });

    await render(
      <template><SessionCopy @session={{this.session}} @visit={{this.visit}} /></template>,
    );
    const yearSelect = '.year-select select';
    const courseSelect = '.course-select select';

    await fillIn(yearSelect, nextYear);
    assert.dom(courseSelect).hasValue(course3.id, 'first course is selected');
    await click('.done');

    const sessions = await this.store.findAll('session');
    assert.strictEqual(sessions.length, 2);
    const newSession = findById(sessions, '2');
    assert.strictEqual(newSession.belongsTo('course').id(), course3.id);
    assert.verifySteps(['visit called']);
  });

  test('copy session into same course saves postrequisites', async function (assert) {
    const thisYear = DateTime.now().year;
    this.server.create('academic-year', {
      id: thisYear,
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      year: thisYear,
      school,
    });

    const sessionType = this.server.create('session-type');

    const postrequisite = this.server.create('session', {
      course,
      sessionType,
    });

    const session = this.server.create('session', {
      course,
      sessionType,
      postrequisite,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newSession.id, 10), 3);
    });

    await render(
      <template><SessionCopy @session={{this.session}} @visit={{this.visit}} /></template>,
    );

    await click('.done');

    const sessions = await this.store.findAll('session');
    assert.strictEqual(sessions.length, 3);
    const newSession = findById(sessions, '3');
    assert.strictEqual(session.title, newSession.title);

    const newPostRequisite = await newSession.postrequisite;
    assert.strictEqual(postrequisite.id, newPostRequisite.id);
    assert.verifySteps(['visit called']);
  });

  test('copy session into different course does not save postrequisites', async function (assert) {
    const thisYear = DateTime.now().year;
    this.server.create('academic-year', {
      id: thisYear,
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      year: thisYear,
      school,
    });
    const secondCourse = this.server.create('course', {
      year: thisYear,
      school,
    });

    const sessionType = this.server.create('session-type');

    const postrequisite = this.server.create('session', {
      course,
      sessionType,
    });

    const session = this.server.create('session', {
      course,
      sessionType,
      postrequisite,
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newSession.id, 10), 3);
    });

    await render(
      <template><SessionCopy @session={{this.session}} @visit={{this.visit}} /></template>,
    );
    const courseSelect = '.course-select select';
    await fillIn(courseSelect, secondCourse.id);
    await click('.done');

    const sessions = await this.store.findAll('session');
    assert.strictEqual(sessions.length, 3);
    const newSession = findById(sessions, '3');
    assert.strictEqual(session.title, newSession.title);

    const newPostRequisite = await newSession.postrequisite;
    assert.strictEqual(newPostRequisite, null);
    assert.verifySteps(['visit called']);
  });

  test('copy session into same course does not save prerequisites', async function (assert) {
    const thisYear = DateTime.now().year;
    this.server.create('academic-year', {
      id: thisYear,
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      year: thisYear,
      school,
    });

    const sessionType = this.server.create('session-type');

    const firstPrerequisite = this.server.create('session', {
      course,
      sessionType,
    });
    const secondPrerequisite = this.server.create('session', {
      course,
      sessionType,
    });

    const session = this.server.create('session', {
      course,
      sessionType,
      prerequisites: [firstPrerequisite, secondPrerequisite],
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newSession.id, 10), 4);
    });

    await render(
      <template><SessionCopy @session={{this.session}} @visit={{this.visit}} /></template>,
    );

    await click('.done');

    const sessions = await this.store.findAll('session');
    assert.strictEqual(sessions.length, 4);
    const newSession = findById(sessions, '4');
    assert.strictEqual(session.title, newSession.title);

    const newPostRequisites = await newSession.prerequisites;
    assert.strictEqual(newPostRequisites.length, 0);
    assert.verifySteps(['visit called']);
  });

  test('copy session into different course does not save prerequisites', async function (assert) {
    const thisYear = DateTime.now().year;
    this.server.create('academic-year', {
      id: thisYear,
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      year: thisYear,
      school,
    });
    const secondCourse = this.server.create('course', {
      year: thisYear,
      school,
    });

    const sessionType = this.server.create('session-type');

    const firstPrerequisite = this.server.create('session', {
      course,
      sessionType,
    });
    const secondPrerequisite = this.server.create('session', {
      course,
      sessionType,
    });

    const session = this.server.create('session', {
      course,
      sessionType,
      prerequisites: [firstPrerequisite, secondPrerequisite],
    });

    class PermissionCheckerMock extends Service {
      canCreateSession() {
        return true;
      }
    }
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
    const sessionModel = await this.store.findRecord('session', session.id);
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.step('visit called');
      assert.strictEqual(parseInt(newSession.id, 10), 4);
    });

    await render(
      <template><SessionCopy @session={{this.session}} @visit={{this.visit}} /></template>,
    );

    const courseSelect = '.course-select select';
    await fillIn(courseSelect, secondCourse.id);
    await click('.done');

    const sessions = await this.store.findAll('session');
    assert.strictEqual(sessions.length, 4);
    const newSession = findById(sessions, '4');
    assert.strictEqual(session.title, newSession.title);

    const newPostRequisites = await newSession.prerequisites;
    assert.strictEqual(newPostRequisites.length, 0);
    assert.verifySteps(['visit called']);
  });
});
