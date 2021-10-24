import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, fillIn, find, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
const { resolve } = RSVP;

module('Integration | Component | learnergroup header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('program-year', { program });
    const cohort = this.server.create('cohort', { programYear });
    const parentGroup = this.server.create('learner-group', { cohort, title: 'parent group' });
    const learnerGroup = this.server.create('learner-group', {
      cohort,
      parent: parentGroup,
      title: 'our group',
    });
    const learnerGroupModel = await this.owner
      .lookup('service:store')
      .find('learner-group', learnerGroup.id);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupHeader @learnerGroup={{this.learnerGroup}} />`);

    assert.dom('.title').hasText('our group');
    assert.equal(
      find('.breadcrumbs').textContent.replace(/\s/g, ''),
      'LearnerGroupsparentgroupourgroup'
    );
    const breadcrumbRootLinkUrl = new URL(find('.breadcrumbs > span a').href);
    assert.equal(breadcrumbRootLinkUrl.search, '?program=1&programYear=1&school=1');
  });

  test('can change title', async function (assert) {
    assert.expect(2);
    const learnerGroup = EmberObject.create({
      title: 'our group',
      save() {
        assert.equal(this.title, 'new title');
      },
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} @canUpdate={{true}} />`);

    assert.dom('.title').hasText('our group');
    await click('.title .editable');
    await fillIn('.title input', 'new title');
    await triggerEvent('.title input', 'input');
    await click('.title .done');
  });

  test('counts members correctly', async function (assert) {
    const cohort = EmberObject.create({
      title: 'test group',
      users: [1, 2],
    });
    const subGroup = EmberObject.create({
      title: 'test sub-group',
      users: [],
      children: [],
    });
    const learnerGroup = EmberObject.create({
      title: 'test group',
      usersOnlyAtThisLevel: [1],
      cohort,
      children: resolve([subGroup]),
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} />`);

    assert.dom('header .info').hasText('Members: 1 / 2');
  });

  test('validate title length', async function (assert) {
    assert.expect(4);
    const title = '.title';
    const edit = `${title} .editable`;
    const input = `${title} input`;
    const done = `${title} .done`;
    const errors = `${title} .validation-error-message`;

    const learnerGroup = EmberObject.create({
      title: 'our group',
      save() {
        assert.ok(false, 'should not be called');
      },
    });

    this.set('learnerGroup', learnerGroup);
    await render(hbs`<LearnergroupHeader @learnerGroup={{learnerGroup}} @canUpdate={{true}} />`);

    assert.dom(title).hasText('our group', 'title is correct');
    assert.dom(errors).doesNotExist('there are no errors');
    await click(edit);
    const longTitle = 'x'.repeat(61);
    await fillIn(input, longTitle);
    await click(done);

    assert.dom(errors).exists({ count: 1 }, 'there is now an error');
    assert.ok(find(errors).textContent.search(/too long/) > -1, 'it is the correct error');
  });
});
