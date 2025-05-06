import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click, findAll } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import ObjectiveSortManager from 'ilios-common/components/objective-sort-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | objective sort manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders for session', async function (assert) {
    const session = this.server.create('session');
    this.server.create('session-objective', { session, position: 1 });
    this.server.create('session-objective', { session, position: 0 });
    const subject = await this.owner.lookup('service:store').findRecord('session', session.id);
    this.set('subject', subject);
    await render(
      <template><ObjectiveSortManager @subject={{this.subject}} @close={{(noop)}} /></template>,
    );
    assert.dom('.item').exists({ count: 2 });
    assert.dom('.item').hasText('session objective 1');
    assert.dom(findAll('.item')[1]).hasText('session objective 0');
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('it renders for course', async function (assert) {
    const course = this.server.create('course');
    this.server.create('course-objective', { course, position: 1 });
    this.server.create('course-objective', { course, position: 0 });
    const subject = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', subject);
    await render(
      <template><ObjectiveSortManager @subject={{this.subject}} @close={{(noop)}} /></template>,
    );
    assert.dom('.item').exists({ count: 2 });
    assert.dom('.item').hasText('course objective 1');
    assert.dom(findAll('.item')[1]).hasText('course objective 0');
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('it renders for program-year', async function (assert) {
    const programYear = this.server.create('program-year');
    this.server.create('program-year-objective', { programYear, position: 1 });
    this.server.create('program-year-objective', { programYear, position: 0 });
    const subject = await this.owner
      .lookup('service:store')
      .findRecord('program-year', programYear.id);
    this.set('subject', subject);
    await render(
      <template><ObjectiveSortManager @subject={{this.subject}} @close={{(noop)}} /></template>,
    );
    assert.dom('.item').exists({ count: 2 });
    assert.dom('.item').hasText('program-year objective 1');
    assert.dom(findAll('.item')[1]).hasText('program-year objective 0');
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    const course = this.server.create('course');
    const subject = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', subject);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action was invoked correctly.');
    });
    await render(
      <template>
        <ObjectiveSortManager @subject={{this.subject}} @close={{this.cancel}} />
      </template>,
    );
    await click('.actions .bigcancel');
  });

  skip('reorder and save', function (assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});
