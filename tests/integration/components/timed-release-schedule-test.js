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
  const startDate = moment().subtract(10, 'minutes');
  const endDate = moment().add(1, 'day');
  this.set('startDate', startDate.toDate());
  this.set('endDate', endDate.toDate());
  this.render(hbs`{{timed-release-schedule startDate=startDate endDate=endDate}}`);
  const expectedStartDate = startDate.format('L LT');
  const expectedEndDate = endDate.format('L LT');

  assert.equal(this.$().text().trim(), `(Available: ${expectedStartDate} and available until ${expectedEndDate})`);
});

test('it renders just start date', function (assert) {
  const tomorrow = moment().add(1, 'day');
  this.set('tomorrow', tomorrow.toDate());
  this.render(hbs`{{timed-release-schedule startDate=tomorrow}}`);
  const expectedDate = tomorrow.format('L LT');

  assert.equal(this.$().text().trim(), `(Available: ${expectedDate})`);
});

test('it renders just end date', function (assert) {
  const tomorrow = moment().add(1, 'day');
  this.set('tomorrow', tomorrow.toDate());
  this.render(hbs`{{timed-release-schedule endDate=tomorrow}}`);
  const expectedDate = tomorrow.format('L LT');

  assert.equal(this.$().text().trim(), `(Available until ${expectedDate})`);
});
