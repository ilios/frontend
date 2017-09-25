import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object: EmberObject } = Ember;

moduleForComponent('learning-material-table-status', 'Integration | Component | learning material table status', {
  integration: true
});

test('it renders with no timed release', function (assert) {
  const row = EmberObject.create({
    startDate: null,
    endDate: null,
  });
  this.set('row', row);
  this.set('value', 'Final');
  const icon = 'i.fa-clock-o';
  this.render(hbs`{{learning-material-table-status value=value row=row}}`);
  assert.equal(this.$(icon).length, 0);
  assert.equal(this.$().text().trim(), 'Final');
});

test('it renders with start date', function (assert) {
  const row = EmberObject.create({
    startDate: new Date(),
    endDate: null,
  });
  this.set('row', row);
  this.set('value', 'Final');
  const icon = 'i.fa-clock-o';
  this.render(hbs`{{learning-material-table-status value=value row=row}}`);
  assert.equal(this.$(icon).length, 1);
  assert.equal(this.$().text().trim(), 'Final');
});

test('it renders with end date', function (assert) {
  const row = EmberObject.create({
    startDate: null,
    endDate: new Date(),
  });
  this.set('row', row);
  this.set('value', 'Final');
  const icon = 'i.fa-clock-o';
  this.render(hbs`{{learning-material-table-status value=value row=row}}`);
  assert.equal(this.$(icon).length, 1);
  assert.equal(this.$().text().trim(), 'Final');
});

test('it renders with both start and end date', function (assert) {
  const row = EmberObject.create({
    startDate: new Date(),
    endDate: new Date(),
  });
  this.set('row', row);
  this.set('value', 'Final');
  const icon = 'i.fa-clock-o';
  this.render(hbs`{{learning-material-table-status value=value row=row}}`);
  assert.equal(this.$(icon).length, 1);
  assert.equal(this.$().text().trim(), 'Final');
});
