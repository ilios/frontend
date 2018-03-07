import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import commonInitializer from "ilios/instance-initializers/load-common-translations";
import moment from 'moment';

module('Integration | Component | session table first offering', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      commonInitializer.initialize(this.owner);
    };
  });

  test('it renders empty', async function(assert) {
    this.set('row', {
      firstOfferingDate: null
    });
    await render(hbs`{{session-table-first-offering row=row}}`);

    assert.equal(find('*').textContent.trim(), '');
  });

  test('it renders offering', async function(assert) {
    const today = moment();
    this.set('row', {
      isIlm: false,
      firstOfferingDate: today.toDate()
    });
    await render(hbs`{{session-table-first-offering row=row}}`);

    assert.equal(find('*').textContent.trim(), today.format('L LT'));
  });

  test('it renders ilm', async function(assert) {
    const today = moment();
    this.set('row', {
      isIlm: true,
      firstOfferingDate: today.toDate()
    });
    await render(hbs`{{session-table-first-offering row=row}}`);

    assert.equal(find('*').textContent.trim(), 'ILM: Due By ' + today.format('L'));
  });
});
