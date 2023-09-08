import { module, test } from 'qunit';
import { setupRenderingTest } from 'ilios/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | reports/subject/new/search/result', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders and works', async function (assert) {
    this.set('isSelected', false);
    await render(hbs`
      <Reports::Subject::New::Search::Result @changeId={{(noop)}} @isSelected={{this.isSelected}}>
        template block text
      </Reports::Subject::New::Search::Result>
    `);
    assert.dom().hasText('template block text');

    assert.dom('button').exists();
    assert.dom('svg').hasClass('add');
    this.set('isSelected', true);
    assert.dom('svg').hasClass('remove');
  });
});
