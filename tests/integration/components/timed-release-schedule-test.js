import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

moduleForComponent('timed-release-schedule', 'Integration | Component | timed release schedule', {
  integration: true
});

test('it renders with no start and end date', function(assert) {
  this.render(hbs`{{timed-release-schedule}}`);

  assert.equal(this.$().text().trim(), 'Available immediately when published');
});

test('it renders with both start and end date', function (assert) {
  const now = moment();
  this.set('now', now.toDate());
  this.render(hbs`{{timed-release-schedule startDate=now endDate=now}}`);
  const expectedDate = now.format('L LT');

  assert.equal(this.$().text().trim(), `Available from ${expectedDate} until ${expectedDate}`);
});

test('it renders just start date', function (assert) {
  const now = moment();
  this.set('now', now.toDate());
  this.render(hbs`{{timed-release-schedule startDate=now}}`);
  const expectedDate = now.format('L LT');

  assert.equal(this.$().text().trim(), `Available after ${expectedDate}`);
});

test('it renders just end date', function (assert) {
  const now = moment();
  this.set('now', now.toDate());
  this.render(hbs`{{timed-release-schedule endDate=now}}`);
  const expectedDate = now.format('L LT');

  assert.equal(this.$().text().trim(), `Available before ${expectedDate}`);
});
