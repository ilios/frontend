import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/selected-instructor-groups';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | selected-instructor-groups', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const instructor1 = this.server.create('user', {
      firstName: 'Joe',
      lastName: 'Doe',
      middleName: 'Michael',
    });
    const instructor2 = this.server.create('user', {
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: 'Anette',
    });
    const instructor3 = this.server.create('user', {
      displayName: 'Clem Chowder',
    });
    const instructorGroup1 = this.server.create('instructor-group', {
      users: [instructor1, instructor2],
    });
    const instructorGroup2 = this.server.create('instructor-group', {
      users: [instructor3],
    });
    const instructorGroup3 = this.server.create('instructor-group');

    this.instructorGroup1 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup1.id);
    this.instructorGroup2 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup2.id);
    this.instructorGroup3 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', instructorGroup3.id);
  });

  test('it renders', async function (assert) {
    this.set('instructors', [this.instructorGroup1, this.instructorGroup2, this.instructorGroup3]);
    await render(
      hbs`<SelectedInstructorGroups @instructorGroups={{this.instructors}} @isManaging={{true}} @remove={{(noop)}}/>`
    );
    assert.strictEqual(component.heading, 'Selected Instructor Groups:');
    assert.strictEqual(component.instructorGroups.length, 3);
    assert.strictEqual(component.instructorGroups[0].title, 'instructor group 0');
    assert.ok(component.instructorGroups[0].isRemovable);
    assert.strictEqual(component.instructorGroups[0].members.length, 2);
    assert.strictEqual(
      component.instructorGroups[0].members[0].userNameInfo.fullName,
      'Jane A. Doe'
    );
    assert.notOk(component.instructorGroups[0].members[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorGroups[0].members[1].userNameInfo.fullName,
      'Joe M. Doe'
    );
    assert.notOk(component.instructorGroups[0].members[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.instructorGroups[1].title, 'instructor group 1');
    assert.ok(component.instructorGroups[1].isRemovable);
    assert.strictEqual(component.instructorGroups[1].members.length, 1);
    assert.strictEqual(
      component.instructorGroups[1].members[0].userNameInfo.fullName,
      'Clem Chowder'
    );
    assert.ok(component.instructorGroups[1].members[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.instructorGroups[2].title, 'instructor group 2');
    assert.ok(component.instructorGroups[2].isRemovable);
    assert.strictEqual(component.instructorGroups[2].members.length, 0);
    assert.notOk(component.noGroups.isVisible);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('read-only', async function (assert) {
    this.set('instructors', [this.instructorGroup1, this.instructorGroup2, this.instructorGroup3]);
    await render(
      hbs`<SelectedInstructorGroups @instructorGroups={{this.instructors}} @isManaging={{false}} />`
    );
    assert.strictEqual(component.heading, 'Selected Instructor Groups:');
    assert.strictEqual(component.instructorGroups.length, 3);
    assert.strictEqual(component.instructorGroups[0].title, 'instructor group 0');
    assert.notOk(component.instructorGroups[0].isRemovable);
    assert.strictEqual(component.instructorGroups[0].members.length, 2);
    assert.strictEqual(
      component.instructorGroups[0].members[0].userNameInfo.fullName,
      'Jane A. Doe'
    );
    assert.notOk(component.instructorGroups[0].members[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(
      component.instructorGroups[0].members[1].userNameInfo.fullName,
      'Joe M. Doe'
    );
    assert.notOk(component.instructorGroups[0].members[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.instructorGroups[1].title, 'instructor group 1');
    assert.notOk(component.instructorGroups[1].isRemovable);
    assert.strictEqual(component.instructorGroups[1].members.length, 1);
    assert.strictEqual(
      component.instructorGroups[1].members[0].userNameInfo.fullName,
      'Clem Chowder'
    );
    assert.ok(component.instructorGroups[1].members[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.instructorGroups[2].title, 'instructor group 2');
    assert.notOk(component.instructorGroups[2].isRemovable);
    assert.strictEqual(component.instructorGroups[2].members.length, 0);
    assert.notOk(component.noGroups.isVisible);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('no instructor groups', async function (assert) {
    this.set('instructors', []);
    await render(hbs`<SelectedInstructorGroups @instructorGroups={{this.instructors}} />`);
    assert.strictEqual(component.heading, 'Selected Instructor Groups:');
    assert.strictEqual(component.instructorGroups.length, 0);
    assert.strictEqual(component.noGroups.text, 'None');
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('remove instructor group', async function (assert) {
    assert.expect(1);
    this.set('instructors', [this.instructorGroup1]);
    this.set('remove', (instructorGroup) => {
      assert.strictEqual(instructorGroup, this.instructorGroup1);
    });
    await render(
      hbs`<SelectedInstructorGroups @instructorGroups={{this.instructors}} @isManaging={{true}} @remove={{this.remove}} />`
    );
    await component.instructorGroups[0].remove();
  });
});
