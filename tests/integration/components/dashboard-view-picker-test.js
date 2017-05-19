import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('dashboard-view-picker', 'Integration | Component | dashbaord view picker', {
  integration: true
});

test('it renders', function(assert) {
  const buttons = 'button';
  const week = `${buttons}:eq(0)`;
  const activities = `${buttons}:eq(1)`;
  const materials = `${buttons}:eq(2)`;
  const calendar = `${buttons}:eq(3)`;

  this.set('nothing', parseInt);
  this.set('show', 'week');
  this.render(hbs`{{dashboard-view-picker show=show change=(action nothing)}}`);

  assert.equal(this.$(week).text().trim(), 'Week at a Glance');
  assert.ok(this.$(week).hasClass('active'));
  assert.equal(this.$(activities).text().trim(), 'Activities');
  assert.notOk(this.$(activities).hasClass('active'));
  assert.equal(this.$(materials).text().trim(), 'Materials');
  assert.notOk(this.$(materials).hasClass('active'));
  assert.equal(this.$(calendar).text().trim(), 'Calendar');
  assert.notOk(this.$(calendar).hasClass('active'));
});

test('changing show changes active button', function(assert) {
  const buttons = 'button';
  const week = `${buttons}:eq(0)`;
  const activities = `${buttons}:eq(1)`;
  const materials = `${buttons}:eq(2)`;
  const calendar = `${buttons}:eq(3)`;

  this.set('nothing', parseInt);
  this.set('show', 'week');
  this.render(hbs`{{dashboard-view-picker show=show change=(action nothing)}}`);

  assert.ok(this.$(week).hasClass('active'));
  assert.notOk(this.$(activities).hasClass('active'));
  assert.notOk(this.$(materials).hasClass('active'));
  assert.notOk(this.$(calendar).hasClass('active'));

  this.set('show', 'agenda');
  assert.notOk(this.$(week).hasClass('agenda'));
  assert.ok(this.$(activities).hasClass('active'));
  assert.notOk(this.$(materials).hasClass('active'));
  assert.notOk(this.$(calendar).hasClass('active'));

  this.set('show', 'materials');
  assert.notOk(this.$(week).hasClass('agenda'));
  assert.notOk(this.$(activities).hasClass('active'));
  assert.ok(this.$(materials).hasClass('active'));
  assert.notOk(this.$(calendar).hasClass('active'));

  this.set('show', 'calendar');
  assert.notOk(this.$(week).hasClass('agenda'));
  assert.notOk(this.$(activities).hasClass('active'));
  assert.notOk(this.$(materials).hasClass('active'));
  assert.ok(this.$(calendar).hasClass('active'));
});

test('clicking week fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const week = `${buttons}:eq(0)`;

  this.set('click', what => {
    assert.equal(what, 'week');
  });
  this.set('show', 'agenda');
  this.render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(week).hasClass('active'));
  this.$(week).click();
});

test('clicking activities fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const activities = `${buttons}:eq(1)`;

  this.set('click', what => {
    assert.equal(what, 'agenda');
  });
  this.set('show', 'materials');
  this.render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(activities).hasClass('active'));
  this.$(activities).click();
});

test('clicking materials fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const materials = `${buttons}:eq(2)`;

  this.set('click', what => {
    assert.equal(what, 'materials');
  });
  this.set('show', 'agenda');
  this.render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(materials).hasClass('active'));
  this.$(materials).click();
});

test('clicking activities fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const calendar = `${buttons}:eq(3)`;

  this.set('click', what => {
    assert.equal(what, 'calendar');
  });
  this.set('show', 'agenda');
  this.render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(calendar).hasClass('active'));
  this.$(calendar).click();
});
