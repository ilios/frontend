import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/mesh-descriptor-last-tree-number';
import MeshDescriptorLastTreeNumber from 'ilios-common/components/mesh-descriptor-last-tree-number';

module('Integration | Component | mesh-descriptor-last-tree-number', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const descriptor = this.server.create('mesh-descriptor');
    this.server.createList('mesh-tree', 5, { descriptor });
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
    const descriptor = this.server.create('mesh-descriptor');
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
