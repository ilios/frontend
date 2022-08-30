import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/selected-instructors';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | selected-instructors', function (hooks) {
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

    this.instructorModel1 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor1.id);
    this.instructorModel2 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor2.id);
    this.instructorModel3 = await this.owner
      .lookup('service:store')
      .findRecord('user', instructor3.id);
  });

  test('it renders', async function (assert) {
    this.set('instructors', [this.instructorModel1, this.instructorModel2, this.instructorModel3]);
    await render(hbs`<SelectedInstructors @instructors={{this.instructors}} />`);
    assert.strictEqual(component.heading, 'Selected Instructors:');
    assert.strictEqual(component.instructors.length, 3);
    await a11yAudit();
    assert.ok(true, 'no a11y errors found!');
  });

  test('no selected instructors', async function (assert) {
    this.set('instructors', []);
    await render(hbs`<SelectedInstructors @instructors={{this.instructors}} />`);
    assert.strictEqual(component.heading, 'Selected Instructors:');
    assert.strictEqual(component.noInstructors.text, 'None');
  });

  test('show default not loaded', async function (assert) {
    this.set('instructors', []);
    await render(
      hbs`<SelectedInstructors @instructors={{this.instructors}} @showDefaultNotLoaded={{true}} />`
    );
    assert.strictEqual(component.heading, 'Selected Instructors: (Default Not Loaded)');
  });

  test('remove selected instructor', async function (assert) {
    assert.expect(4);
    this.set('instructors', [this.instructorModel1, this.instructorModel2]);
    this.set('remove', (user) => {
      assert.strictEqual(user.id, this.instructorModel1.id);
    });
    await render(
      hbs`<SelectedInstructors @instructors={{this.instructors}} @isManaging={{true}} @remove={{this.remove}}/>`
    );
    assert.strictEqual(component.heading, 'Selected Instructors:');
    assert.strictEqual(component.instructors.length, 2);
    assert.strictEqual(component.instructors[1].userNameInfo.fullName, 'Joe M. Doe');
    await component.instructors[1].remove();
  });
});
