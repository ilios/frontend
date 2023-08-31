import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/learner-group/header';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | learner-group/header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
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
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
    );
    assert.strictEqual(component.title.text, 'lorem ipsum');
    assert.ok(component.title.isEditable);
    assert.ok(component.members, 'Members: 3');
    assert.strictEqual(component.breadcrumb.crumbs.length, 2);
    assert.strictEqual(component.breadcrumb.crumbs[0].text, 'Learner Groups');
    assert.strictEqual(component.breadcrumb.crumbs[1].text, 'lorem ipsum');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders in read-only mode', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', false);

    await render(
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
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
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
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
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.strictEqual(component.title.errors.length, 0);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('01234567890'.repeat(1000));
    await component.title.save();
    assert.strictEqual(component.title.errors.length, 1);
  });

  test('changing title fails if new title is too short', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.strictEqual(component.title.errors.length, 0);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('AB');
    await component.title.save();
    assert.strictEqual(component.title.errors.length, 1);
  });

  test('changing title fails if title is blank', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.strictEqual(component.title.errors.length, 0);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('');
    await component.title.save();
    assert.strictEqual(component.title.errors.length, 1);
  });

  test('cancel title changes', async function (assert) {
    this.set('learnerGroup', this.learnerGroup);
    this.set('canUpdate', true);

    await render(
      hbs`<LearnerGroup::Header @learnerGroup={{this.learnerGroup}} @canUpdate={{this.canUpdate}} />`,
    );

    assert.strictEqual(component.title.text, 'lorem ipsum');
    await component.title.edit();
    assert.strictEqual(component.title.errors.length, 0);
    assert.strictEqual(component.title.value, 'lorem ipsum');
    await component.title.set('foo bar');
    await component.title.cancel();
    assert.strictEqual(component.title.text, 'lorem ipsum');
  });
});
