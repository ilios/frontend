import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';

module('Integration | Component | breadcrumbs', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    const routes = [
      { route: 'foo', title: 'Foo' },
      { route: 'bar', title: 'Bar' },
    ];
    const rootTitle = 'Baz';
    await render(<template><Breadcrumbs @routes={{routes}} @rootTitle={{rootTitle}} /></template>);

    assert.dom('.breadcrumbs').exists();
    assert.dom('.crumb').exists({ count: 3 });
  });
});
