import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import noop from 'ilios-common/helpers/noop';
import DownloadDropdownItem from 'frontend/components/download-dropdown-item';

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
