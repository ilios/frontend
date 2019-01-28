import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | recently updated display', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const lastModified = moment().subtract(5, 'day');

    this.set('lastModified', lastModified);
    await render(hbs`{{recently-updated-display lastModified=lastModified}}`);

    return settled().then(()=>{
      assert.dom('.fa-exclamation-circle').exists({ count: 1 }, 'it renders');
    });
  });

  test('it does not render', async function(assert) {
    const lastModified = moment().subtract(9, 'day');

    this.set('lastModified', lastModified);
    await render(hbs`{{recently-updated-display}}`);

    return settled().then(()=>{
      assert.dom('.fa-exclamation-circle').doesNotExist('it does not renders');
    });
  });
});
