import { setupRenderingTest } from 'ember-qunit';
import { render, click, findAll } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | objective sort manager', async function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  test('it renders for session', async function(assert) {
    assert.expect(5);

    const objective1 = this.server.create('objective');
    const objective2 = this.server.create('objective');
    const session = this.server.create('session');
    this.server.create('session-objective', { session, objective: objective1, position: 1 });
    this.server.create('session-objective', { session, objective: objective2, position: 0 });
    const subject = await this.owner.lookup('service:store').find('session', session.id);
    this.set('subject', subject);
    await render(hbs`<ObjectiveSortManager @subject={{this.subject}} @close={{noop}} />`);
    assert.dom('.draggable-object').exists({ count: 2 });
    assert.dom('.draggable-object').hasText(objective2.title);
    assert.dom(findAll('.draggable-object')[1]).hasText(objective1.title);
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('it renders for course', async function(assert) {
    assert.expect(5);
    const objective1 = this.server.create('objective');
    const objective2 = this.server.create('objective');
    const course = this.server.create('course');
    this.server.create('course-objective', { course, objective: objective1, position: 1 });
    this.server.create('course-objective', { course, objective: objective2, position: 0 });
    const subject = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', subject);
    await render(hbs`<ObjectiveSortManager @subject={{this.subject}} @close={{noop}} />`);
    assert.dom('.draggable-object').exists({ count: 2 });
    assert.dom('.draggable-object').hasText(objective2.title);
    assert.dom(findAll('.draggable-object')[1]).hasText(objective1.title);
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('it renders for program-year', async function(assert) {
    assert.expect(5);

    const objective1 = this.server.create('objective');
    const objective2 = this.server.create('objective');
    const programYear = this.server.create('programYear');
    this.server.create('program-year-objective', { programYear, objective: objective1, position: 1 });
    this.server.create('program-year-objective', { programYear, objective: objective2, position: 0 });
    const subject = await this.owner.lookup('service:store').find('programYear', programYear.id);
    this.set('subject', subject);
    await render(hbs`<ObjectiveSortManager @subject={{this.subject}} @close={{noop}} />`);
    assert.dom('.draggable-object').exists({ count: 2 });
    assert.dom('.draggable-object').hasText(objective2.title);
    assert.dom(findAll('.draggable-object')[1]).hasText(objective1.title);
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    const course = this.server.create('course');
    const subject = await this.owner.lookup('service:store').find('course', course.id);
    this.set('subject', subject);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action was invoked correctly.');
    });
    await render(hbs`<ObjectiveSortManager @subject={{this.subject}} @close={{this.cancel}} />`);
    await click('.actions .bigcancel');
  });

  skip('reorder and save', function(assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});
