import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/instructor-group/courses';

module('Integration | Component | instructor-group/courses', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
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
      .find('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroup::Courses @instructorGroup={{this.instructorGroup}} />`);
    assert.strictEqual(component.title, 'Associated Courses (3)');
    assert.strictEqual(component.courses.length, 3);
    assert.strictEqual(component.courses[0].text, 'course 0');
    assert.strictEqual(component.courses[0].url, '/courses/1');
    assert.strictEqual(component.courses[1].text, 'course 1');
    assert.strictEqual(component.courses[1].url, '/courses/2');
    assert.strictEqual(component.courses[2].text, 'course 2');
    assert.strictEqual(component.courses[2].url, '/courses/3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('no linked courses', async function (assert) {
    const instructorGroup = this.server.create('instructor-group');
    const instructorGroupModel = await this.owner
      .lookup('service:store')
      .find('instructor-group', instructorGroup.id);
    this.set('instructorGroup', instructorGroupModel);
    await render(hbs`<InstructorGroup::Courses @instructorGroup={{this.instructorGroup}} />`);
    assert.strictEqual(component.title, 'Associated Courses (0)');
    assert.strictEqual(component.courses.length, 0);
  });
});
