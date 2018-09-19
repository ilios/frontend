import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | session copy', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const now = moment();
    const thisYear = now.year();
    const lastYear = thisYear - 1;
    const nextYear = thisYear + 1;

    [lastYear, thisYear, nextYear].forEach(year => {
      this.server.create('academic-year', {
        id: year,
        title: year
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
      course
    });

    const permissionCheckerMock = Service.extend({
      canCreateSession() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    const sessionModel = await run(() => this.owner.lookup('service:store').find('session', session.id));
    this.set('session', sessionModel);

    await render(hbs`{{session-copy session=session}}`);

    const yearSelect = '.year-select select';
    const courseSelect = '.course-select select';
    const save = '.done';

    assert.dom(`${yearSelect} option`).exists({ count: 3 });
    for (let i = 1; i <= 2; i++){
      assert.dom(`${yearSelect} option:nth-of-type(${i})`).hasText(`${lastYear + i - 1} - ${lastYear + i}`);
    }
    assert.dom(`${courseSelect} option`).exists({ count: 2 });
    assert.dom(`${courseSelect} option:nth-of-type(1)`).hasText(course.title);
    assert.dom(`${courseSelect} option:nth-of-type(2)`).hasText(course2.title);
    assert.notOk(find(save).enabled);

  });

  test('copy session', async function(assert) {
    assert.expect(19);

    const thisYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('academic-year', {
      id: thisYear,
      title: thisYear
    });

    const school = this.server.create('school');
    const course = this.server.create('course', {
      title: 'old course',
      year: thisYear,
      school
    });
    const learningMaterial = this.server.create('learning-material');
    const sessionLearningMaterial = this.server.create('session-learning-material', {
      notes: 'some notes',
      required: false,
      publicNotes: true,
      learningMaterial,
      position: 3,
    });
    const parentObjective = this.server.create('objective');
    const objective = this.server.create('objective', {
      title: 'session objective title',
      parents: [parentObjective],
      position: 3,
    });
    const meshDescriptor = this.server.create('mesh-descriptor');
    const term = this.server.create('term');
    const sessionType = this.server.create('session-type');
    const sessionDescription = this.server.create('session-description', {
      description: 'test description'
    });

    const session = this.server.create('session', {
      title: 'old session',
      course,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      sessionType,
      sessionDescription,
      objectives: [objective],
      meshDescriptors: [meshDescriptor],
      terms: [term],
      learningMaterials: [sessionLearningMaterial],
    });

    const permissionCheckerMock = Service.extend({
      canCreateSession() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    const sessionModel = await run(() => this.owner.lookup('service:store').find('session', session.id));
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.equal(newSession.id, 2);
    });
    await render(hbs`{{session-copy session=session visit=(action visit)}}`);

    await click('.done');

    const sessions = await run(() => this.owner.lookup('service:store').findAll('session'));
    assert.equal(sessions.length, 2);
    const newSession = sessions.findBy('id', '1');
    assert.equal(session.attireRequired, newSession.attireRequired);
    assert.equal(session.equipmentRequired, newSession.equipmentRequired);
    assert.equal(session.supplemental, newSession.supplemental);
    assert.equal(session.title, newSession.title);

    const sessionLearningMaterials = await run(() => this.owner.lookup('service:store').findAll('session-learning-material'));
    assert.equal(sessionLearningMaterials.length, 2);
    const newSessionLm = sessionLearningMaterials.findBy('id', '1');
    assert.equal(sessionLearningMaterial.notes, newSessionLm.notes);
    assert.equal(sessionLearningMaterial.required, newSessionLm.required);
    assert.equal(sessionLearningMaterial.publicNotes, newSessionLm.publicNotes);
    assert.equal(sessionLearningMaterial.position, newSessionLm.position);
    assert.equal(newSessionLm.belongsTo('session').id(), newSession.id);
    assert.equal(newSessionLm.belongsTo('learningMaterial').id(), learningMaterial.id);

    const sessionDescriptions = await run(() => this.owner.lookup('service:store').findAll('session-description'));
    assert.equal(sessionLearningMaterials.length, 2);
    const newSessionDescription = sessionDescriptions.findBy('id', '1');
    assert.equal(sessionDescription.description, newSessionDescription.description);
    assert.equal(newSessionDescription.belongsTo('session').id(), newSession.id);

    const objectives = await run(() => this.owner.lookup('service:store').findAll('objective'));
    assert.equal(objectives.length, 3);
    const newObjective = objectives.findBy('id', '3');
    assert.equal(objective.title, newObjective.title);
    assert.equal(objective.position, newObjective.position);
  });

  test('errors do not show up initially and save cannot be clicked', async function(assert) {
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
      sessionType,
    });

    const permissionCheckerMock = Service.extend({
      canCreateSession() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    const sessionModel = await run(() => this.owner.lookup('service:store').find('session', session.id));
    this.set('session', sessionModel);

    await render(hbs`{{session-copy session=session}}`);
    const save = '.done';
    assert.dom('.validation-error-message').doesNotExist();
    assert.dom(save).isDisabled();
  });

  test('changing the year looks for new matching courses', async function(assert) {
    assert.expect(5);
    const thisYear = parseInt(moment().format('YYYY'), 10);
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
      year: thisYear
    });
    const course2 = this.server.create('course', {
      school,
      year: nextYear
    });

    const sessionType = this.server.create('session-type');

    const session = this.server.create('session', {
      course: course1,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      sessionType,
    });

    const permissionCheckerMock = Service.extend({
      canCreateSession() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    const sessionModel = await run(() => this.owner.lookup('service:store').find('session', session.id));
    this.set('session', sessionModel);
    await render(hbs`{{session-copy session=session}}`);
    const yearSelect = '.year-select select';
    const courseSelect = '.course-select select';

    assert.dom(yearSelect).hasValue(thisYear);
    assert.dom(`${courseSelect} option`).exists({ count: 1 });
    assert.dom(`${courseSelect} option:nth-of-type(1)`).hasText(course1.title);

    await fillIn(yearSelect, nextYear);
    assert.dom(`${courseSelect} option`).exists({ count: 1 });
    assert.dom(`${courseSelect} option:nth-of-type(1)`).hasText(course2.title);
  });

  test('copy session into the first course in a different year #2130', async function(assert) {
    assert.expect(4);
    const thisYear = parseInt(moment().format('YYYY'), 10);
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
      year: thisYear
    });
    this.server.create('course', {
      school,
      year: nextYear
    });
    const course3 = this.server.create('course', {
      school,
      title: 'alpha first',
      year: nextYear
    });

    const sessionType = this.server.create('session-type');

    const session = this.server.create('session', {
      course,
      attireRequired: true,
      equipmentRequired: false,
      supplemental: true,
      sessionType,
    });

    const permissionCheckerMock = Service.extend({
      canCreateSession() {
        return true;
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);
    const sessionModel = await run(() => this.owner.lookup('service:store').find('session', session.id));
    this.set('session', sessionModel);
    this.set('visit', (newSession) => {
      assert.equal(newSession.id, 2);
    });
    await render(hbs`{{session-copy session=session visit=(action visit)}}`);
    const yearSelect = '.year-select select';
    const courseSelect = '.course-select select';

    await fillIn(yearSelect, nextYear);
    assert.dom(courseSelect).hasValue(course3.id, 'first course is selected');
    await click('.done');

    const sessions = await run(() => this.owner.lookup('service:store').findAll('session'));
    assert.equal(sessions.length, 2);
    const newSession = sessions.findBy('id', '2');
    assert.equal(newSession.belongsTo('course').id(), course3.id);
  });
});
