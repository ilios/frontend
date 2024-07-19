import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-session-types-collapsed';

module('Integration | Component | school session types collapsed', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('session-type', 2, {
      school,
      assessment: true,
    });
    this.server.create('session-type', {
      school,
      assessment: false,
    });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);

    await render(hbs`<SchoolSessionTypesCollapsed @school={{this.school}} @expand={{(noop)}} />`);

    assert.strictEqual(component.title, 'Session Types (3)');
    assert.strictEqual(component.sessionTypeMethods.length, 2);
    assert.strictEqual(component.sessionTypeMethods[0].title, 'Assessment Methods');
    assert.strictEqual(component.sessionTypeMethods[0].summary, 'There are 2 types');
    assert.strictEqual(component.sessionTypeMethods[1].title, 'Instructional Methods');
    assert.strictEqual(component.sessionTypeMethods[1].summary, 'There is 1 type');
  });

  test('expand', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('expand', () => {
      assert.ok(true, 'expand triggers.');
    });

    await render(
      hbs`<SchoolSessionTypesCollapsed @school={{this.school}} @expand={{this.expand}} />`,
    );

    await component.expand();
  });
});
