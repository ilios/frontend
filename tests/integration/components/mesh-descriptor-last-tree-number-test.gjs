import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'frontend/tests/msw';
import { component } from 'frontend/tests/pages/components/mesh-descriptor-last-tree-number';
import MeshDescriptorLastTreeNumber from 'frontend/components/mesh-descriptor-last-tree-number';

module('Integration | Component | mesh-descriptor-last-tree-number', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders', async function (assert) {
    const descriptor = await this.server.create('mesh-descriptor');
    await this.server.createList('mesh-tree', 5, { descriptor });
    const descriptorModel = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', descriptor.id);
    this.set('descriptor', descriptorModel);
    await render(
      <template><MeshDescriptorLastTreeNumber @descriptor={{this.descriptor}} /></template>,
    );
    assert.strictEqual(component.text, 'tree number 4');
  });

  test('it renders with empty trees', async function (assert) {
    const descriptor = await this.server.create('mesh-descriptor');
    const descriptorModel = await this.owner
      .lookup('service:store')
      .findRecord('mesh-descriptor', descriptor.id);
    this.set('descriptor', descriptorModel);
    await render(
      <template><MeshDescriptorLastTreeNumber @descriptor={{this.descriptor}} /></template>,
    );
    assert.strictEqual(component.text, '');
  });
});
