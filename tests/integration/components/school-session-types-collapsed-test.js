import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-session-types-collapsed';

module('Integration | Component | school session types collapsed', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.create('session-type', { school, assessment: true });
    this.server.create('session-type', { school, assessment: false });
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);

    await render(hbs`<SchoolSessionTypesCollapsed @school={{this.school}} @expand={{(noop)}} />
`);

    assert.strictEqual(parseInt(component.assessmentCount, 10), 1);
    assert.strictEqual(parseInt(component.instructionalCount, 10), 1);
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
      hbs`<SchoolSessionTypesCollapsed @school={{this.school}} @expand={{this.expand}} />
`
    );

    await component.expand();
  });
});
