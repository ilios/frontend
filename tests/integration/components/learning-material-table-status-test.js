import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | learning material table status', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with no timed release', async function(assert) {
    const row = EmberObject.create({
      startDate: null,
      endDate: null,
    });
    this.set('row', row);
    this.set('value', 'Final');
    const icon = 'i.fa-clock-o';
    await render(hbs`{{learning-material-table-status value=value row=row}}`);
    assert.equal(this.$(icon).length, 0);
    assert.equal(this.$().text().trim(), 'Final');
  });

  test('it renders with start date', async function(assert) {
    const row = EmberObject.create({
      startDate: new Date(),
      endDate: null,
    });
    this.set('row', row);
    this.set('value', 'Final');
    const icon = 'i.fa-clock-o';
    await render(hbs`{{learning-material-table-status value=value row=row}}`);
    assert.equal(this.$(icon).length, 1);
    assert.equal(this.$().text().trim(), 'Final');
  });

  test('it renders with end date', async function(assert) {
    const row = EmberObject.create({
      startDate: null,
      endDate: new Date(),
    });
    this.set('row', row);
    this.set('value', 'Final');
    const icon = 'i.fa-clock-o';
    await render(hbs`{{learning-material-table-status value=value row=row}}`);
    assert.equal(this.$(icon).length, 1);
    assert.equal(this.$().text().trim(), 'Final');
  });

  test('it renders with both start and end date', async function(assert) {
    const row = EmberObject.create({
      startDate: new Date(),
      endDate: new Date(),
    });
    this.set('row', row);
    this.set('value', 'Final');
    const icon = 'i.fa-clock-o';
    await render(hbs`{{learning-material-table-status value=value row=row}}`);
    assert.equal(this.$(icon).length, 1);
    assert.equal(this.$().text().trim(), 'Final');
  });
});