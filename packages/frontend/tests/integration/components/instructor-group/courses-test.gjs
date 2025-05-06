import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/instructor-group/courses';
import Courses from 'frontend/components/instructor-group/courses';

module('Integration | Component | instructor-group/courses', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with single course year if calendar year boundary IS NOT crossed', async function (assert) {
    const courses = this.server.createList('course', 3);
    const session1 = this.server.create('session', {
      course: courses[0],
    });
    const session2 = this.server.create('session', {
      course: courses[1],
    });
    const session3 = this.server.create('session', {
      course: courses[2],
    });
    const offering1 = this.server.create('offering', {
      session: session1,
    });
    const offering2 = this.server.create('offering', {
      session: session2,
    });
    const ilmSession = this.server.create('ilm-session', {
      session: session3,
    });
    const instructorGroup = this.server.create('instructor-group', {
      offerings: [offering1, offering2],
      ilmSessions: [ilmSession],
    });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: false,
          apiVersion,
        },
      };
    });
    await render(<template><Courses @instructorGroup={{this.instructorGroup}} /></template>);
    assert.strictEqual(component.title, 'Associated Courses (3)');
    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].text, 'course 0 (2013)');
    assert.strictEqual(component.courses[0].url, '/courses/1');
    assert.strictEqual(component.courses[1].text, 'course 1 (2013)');
    assert.strictEqual(component.courses[1].url, '/courses/2');
    assert.strictEqual(component.courses[2].text, 'course 2 (2013)');
    assert.strictEqual(component.courses[2].url, '/courses/3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with course year range if calendar year boundary IS crossed', async function (assert) {
    const courses = this.server.createList('course', 3);
    const session1 = this.server.create('session', {
      course: courses[0],
    });
    const session2 = this.server.create('session', {
      course: courses[1],
    });
    const session3 = this.server.create('session', {
      course: courses[2],
    });
    const offering1 = this.server.create('offering', {
      session: session1,
    });
    const offering2 = this.server.create('offering', {
      session: session2,
    });
    const ilmSession = this.server.create('ilm-session', {
      session: session3,
    });
    const instructorGroup = this.server.create('instructor-group', {
      offerings: [offering1, offering2],
      ilmSessions: [ilmSession],
    });
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await render(<template><Courses @instructorGroup={{this.instructorGroup}} /></template>);
    assert.strictEqual(component.title, 'Associated Courses (3)');
    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].text, 'course 0 (2013 - 2014)');
    assert.strictEqual(component.courses[0].url, '/courses/1');
    assert.strictEqual(component.courses[1].text, 'course 1 (2013 - 2014)');
    assert.strictEqual(component.courses[1].url, '/courses/2');
    assert.strictEqual(component.courses[2].text, 'course 2 (2013 - 2014)');
    assert.strictEqual(component.courses[2].url, '/courses/3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('no linked courses', async function (assert) {
    const instructorGroup = this.server.create('instructor-group');
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(<template><Courses @instructorGroup={{this.instructorGroup}} /></template>);
    assert.strictEqual(component.title, 'Associated Courses (0)');
    assert.strictEqual(component.courses.length, 0);
  });
});
