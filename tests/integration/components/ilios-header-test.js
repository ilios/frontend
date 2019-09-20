import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'ilios/tests/pages/components/ilios-header';

module('Integration | Component | ilios-header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    this.set('title', 'Some Title');
    await render(hbs`<IliosHeader @title={{this.title}} />`);
    assert.ok(component.hasTitle);
    assert.equal(component.title, 'Some Title');

    await a11yAudit(this.element);
  });

  test('title is hidden when not set', async function (assert) {
    await render(hbs`<IliosHeader />`);
    assert.ok(!component.hasTitle);

    await a11yAudit(this.element);
  });
});
