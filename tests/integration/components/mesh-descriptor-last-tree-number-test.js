import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/mesh-descriptor-last-tree-number';

module('Integration | Component | mesh-descriptor-last-tree-number', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const descriptor = this.server.create('mesh-descriptor');
    this.server.createList('mesh-tree', 5, { descriptor });
    const descriptorModel = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', descriptor.id);
    this.set('descriptor', descriptorModel);
    await render(hbs`<MeshDescriptorLastTreeNumber @descriptor={{this.descriptor}} />
`);
    assert.strictEqual(component.text, 'tree number 4');
  });

  test('it renders with empty trees', async function (assert) {
    const descriptor = this.server.create('mesh-descriptor');
    const descriptorModel = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', descriptor.id);
    this.set('descriptor', descriptorModel);
    await render(hbs`<MeshDescriptorLastTreeNumber @descriptor={{this.descriptor}} />
`);
    assert.strictEqual(component.text, '');
  });
});
