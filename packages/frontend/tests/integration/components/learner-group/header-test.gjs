import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/learner-group/header';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import Header from 'frontend/components/learner-group/header';

module('Integration | Component | learner-group/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const users = this.server.createList('user', 3);
    const school = this.server.create('school', { title: 'Medicine' });
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const learnerGroup = this.server.create('learner-group', {
      title: 'lorem ipsum',
      cohort,
      users,
    });
    this.learnerGroup = await this.owner
      .lookup('service:store')
      .findRecord('learner-group', learnerGroup.id);
  });

  test('it renders', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);
    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );
    assert.strictEqual(component.title.text, 'lorem ipsum', 'title is correct');
    assert.ok(component.title.isEditable, 'title is editable');
    assert.ok(component.members, 'Members: 3');
    assert.strictEqual(component.breadcrumb.crumbs.length, 3, 'breadcrumb count is correct');
    assert.strictEqual(
      component.breadcrumb.crumbs[0].text,
      'Learner Groups',
      'first breadcrumb text is correct',
    );
    assert.strictEqual(
      component.breadcrumb.crumbs[1].text,
      'program 0 cohort 0',
      'second breadcrumb text is correct',
    );
    assert.strictEqual(
      component.breadcrumb.crumbs[2].text,
      'lorem ipsum',
      'third breadcrumb text is correct',
    );
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders in read-only mode', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', false);

    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    assert.notOk(component.title.isEditable);
    assert.ok(component.members, 'Members: 3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('change title', async function (assert) {
    const newTitle = 'foo bar';
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set(newTitle);
    await component.title.save();
    assert.strictEqual(component.title.text, 'foo bar');
  });

  test('changing title fails if new title is too long', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('01234567890'.repeat(1000));
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 60 characters)');
  });

  test('changing title fails if new title is too short', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.notOk(component.title.hasErrors);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('AB');
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too short (minimum is 3 characters)');
  });

  test('changing title fails if title is blank', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.notOk(component.title.hasErrors);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('');
    await component.title.save();
    assert.strictEqual(component.title.error, 'Title is too short (minimum is 3 characters)');
  });

  test('cancel title changes', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      <template>
        <Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />
      </template>,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.notOk(component.title.hasError);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('foo bar');
    await component.title.cancel();
    assert.strictEqual(component.title.text, 'lorem ipsum');
  });
});
