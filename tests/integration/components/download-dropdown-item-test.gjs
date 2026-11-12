import { render } from '@ember/test-helpers';
import DownloadDropdownItem from 'frontend/components/download-dropdown-item';
import noop from 'frontend/helpers/noop';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Integration | Component | download-dropdown-item', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const item = {
      title: 'Link 1',
      tooltip: 'Link 1 tooltip',
      filename: 'file1.csv',
    };

    await render(
      <template>
        <DownloadDropdownItem
          @item={{item}}
          @index={{0}}
          @action={{(noop)}}
          @closeMenu={{(noop)}}
        />
      </template>,
    );

    assert.dom('[data-test-item]').exists();
    assert.dom('[data-test-item]').hasText('Link 1');
  });
});
