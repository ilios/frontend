import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { getUniqueName } from '../../../helpers/percy-snapshot-name';
import page from 'ilios-common/page-objects/session';
import percySnapshot from '@percy/ember';

module('Acceptance | Session - Objective Parents', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    const course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const courseObjectives = this.server.createList('course-objective', 3, {
      course,
    });
    const sessionType = this.server.create('session-type', { school: this.school });
    const session = this.server.create('session', { course, sessionType });
    this.server.create('session-objective', {
      session,
      courseObjectives: courseObjectives.slice(0, 2),
    });
    this.server.create('session-objective', { session });
  });

  test('list parent objectives', async function (assert) {
    assert.expect(13);
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });
    assert.strictEqual(page.details.objectives.objectiveList.objectives.length, 2);

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'course objective 1',
    );

    await percySnapshot(getUniqueName(assert, 'default background color'));
    await page.details.objectives.objectiveList.objectives[0].parents.manage();
    await percySnapshot(getUniqueName(assert, 'managed background color'));

    const m = page.details.objectives.objectiveList.objectives[0].parentManager;
    assert.strictEqual(m.courseTitle, 'course 0');
    assert.strictEqual(m.objectives.length, 3);
    assert.strictEqual(m.objectives[0].title, 'course objective 0');
    assert.ok(m.objectives[0].selected);
    assert.strictEqual(m.objectives[1].title, 'course objective 1');
    assert.ok(m.objectives[1].selected);
    assert.strictEqual(m.objectives[2].title, 'course objective 2');
    assert.ok(m.objectives[2].notSelected);
  });

  test('save changes', async function (assert) {
    assert.expect(12);
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'course objective 1',
    );

    await percySnapshot(getUniqueName(assert, 'default background color'));
    await page.details.objectives.objectiveList.objectives[0].parents.manage();
    await percySnapshot(getUniqueName(assert, 'managed background color'));

    const m = page.details.objectives.objectiveList.objectives[0].parentManager;
    assert.strictEqual(m.courseTitle, 'course 0');
    await m.objectives[0].add();
    await m.objectives[2].add();
    assert.ok(m.objectives[0].notSelected);
    assert.ok(m.objectives[1].selected);
    assert.ok(m.objectives[2].selected);
    await page.details.objectives.objectiveList.objectives[0].parents.save();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 1',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'course objective 2',
    );
  });

  test('cancel changes', async function (assert) {
    assert.expect(12);
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'course objective 1',
    );

    await percySnapshot(getUniqueName(assert, 'default background color'));
    await page.details.objectives.objectiveList.objectives[0].parents.manage();
    await percySnapshot(getUniqueName(assert, 'managed background color'));

    const m = page.details.objectives.objectiveList.objectives[0].parentManager;
    assert.strictEqual(m.courseTitle, 'course 0');
    await m.objectives[0].add();
    await m.objectives[2].add();
    assert.ok(m.objectives[0].notSelected);
    assert.ok(m.objectives[1].selected);
    assert.ok(m.objectives[2].selected);
    await page.details.objectives.objectiveList.objectives[0].parents.cancel();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'course objective 1',
    );
  });

  test('deselect all parents for session objective', async function (assert) {
    assert.expect(10);
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({
      courseId: 1,
      sessionId: 1,
      sessionObjectiveDetails: true,
    });

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.strictEqual(page.details.objectives.objectiveList.objectives[0].parents.list.length, 2);
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[0].text,
      'course objective 0',
    );
    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].parents.list[1].text,
      'course objective 1',
    );

    await percySnapshot(getUniqueName(assert, 'default background color'));
    await page.details.objectives.objectiveList.objectives[0].parents.manage();
    await percySnapshot(getUniqueName(assert, 'managed background color'));

    const m = page.details.objectives.objectiveList.objectives[0].parentManager;
    assert.strictEqual(m.courseTitle, 'course 0');
    await m.objectives[0].add();
    await m.objectives[1].add();
    assert.ok(m.objectives[0].notSelected);
    assert.ok(m.objectives[1].notSelected);
    assert.ok(m.objectives[2].notSelected);
    await page.details.objectives.objectiveList.objectives[0].parents.save();

    assert.strictEqual(
      page.details.objectives.objectiveList.objectives[0].description.fadeText.displayText.text,
      'session objective 0',
    );
    assert.ok(page.details.objectives.objectiveList.objectives[0].parents.empty);
  });
});
