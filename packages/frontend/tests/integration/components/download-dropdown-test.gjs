import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import noop from 'ilios-common/helpers/noop';
import { component } from 'frontend/tests/pages/components/download-dropdown';
import DownloadDropdown from 'frontend/components/download-dropdown';

module('Integration | Component | download-dropdown', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const options = [
      {
        title: 'Link 1',
        tooltip: 'Link 1 tooltip',
        filename: 'file1.csv',
      },
      {
        title: 'Link 2',
        tooltip: 'Link 2 tooltip',
        filename: 'file2.csv',
      },
    ];

    await render(<template><DownloadDropdown @links={{options}} @action={{(noop)}} /></template>);

    assert.ok(component, 'component exists');
    assert.notOk(component.menu.displays, 'component menu does not exist yet');

    await component.toggle();

    assert.ok(component.menu.displays, 'component menu now exists');
    assert.strictEqual(component.menu.items.length, 2, 'menu items count correct');

    await component.toggle();

    assert.notOk(component.menu.displays, 'component menu no longer exists');
  });
});
