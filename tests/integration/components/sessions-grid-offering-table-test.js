import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';
import moment from 'moment';
import { create } from 'ember-cli-page-object';
import table from 'ilios/tests/pages/components/sessions-grid-offering-table';

const page = create({ table });

module('Integration | Component | sessions-grid-offering-table', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:moment').setLocale('en');
  }),

  test('it renders', async function (assert) {
    const session = this.server.create('session');
    this.server.createList('offering', 3, {
      session
    });
    this.server.createList('offering', 3, {
      session,
      startDate: moment().add(1, 'hour').toDate(),
      endDate: moment().add(110, 'minutes').toDate(),
    });
    this.server.createList('offering', 3, {
      session,
      startDate: moment().add(1, 'day').add(1, 'hour').toDate(),
      endDate: moment().add(1, 'day').add(2, 'hour').toDate(),
    });
    const offerings = run(() => this.owner.lookup('service:store').findAll('offering'));
    this.set('offerings', offerings);

    await render(hbs`{{sessions-grid-offering-table offerings=offerings}}`);

    assert.equal(page.table.dates.length, 2);
    assert.equal(page.table.offerings.length, 9);
  });
});
