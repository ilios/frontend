import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('calendar-view-picker', 'Integration | Component | calendar view picker', {
  integration: true
});

test('it renders', function(assert) {
  const buttons = 'button';
  const activities = `${buttons}:eq(0)`;
  const materials = `${buttons}:eq(1)`;
  const calendar = `${buttons}:eq(2)`;

  this.set('nothing', parseInt);
  this.set('show', 'agenda');
  this.render(hbs`{{calendar-view-picker show=show change=(action nothing)}}`);

  assert.equal(this.$(activities).text().trim(), 'Activities');
  assert.ok(this.$(activities).hasClass('active'));
  assert.equal(this.$(materials).text().trim(), 'Materials');
  assert.notOk(this.$(materials).hasClass('active'));
  assert.equal(this.$(calendar).text().trim(), 'Calendar');
  assert.notOk(this.$(calendar).hasClass('active'));
});

test('changing show changes active button', function(assert) {
  const buttons = 'button';
  const activities = `${buttons}:eq(0)`;
  const materials = `${buttons}:eq(1)`;
  const calendar = `${buttons}:eq(2)`;

  this.set('nothing', parseInt);
  this.set('show', 'agenda');
  this.render(hbs`{{calendar-view-picker show=show change=(action nothing)}}`);

  assert.ok(this.$(activities).hasClass('active'));
  assert.notOk(this.$(materials).hasClass('active'));
  assert.notOk(this.$(calendar).hasClass('active'));

  this.set('show', 'materials');
  assert.notOk(this.$(activities).hasClass('active'));
  assert.ok(this.$(materials).hasClass('active'));
  assert.notOk(this.$(calendar).hasClass('active'));

  this.set('show', 'calendar');
  assert.notOk(this.$(activities).hasClass('active'));
  assert.notOk(this.$(materials).hasClass('active'));
  assert.ok(this.$(calendar).hasClass('active'));
});

test('clicking activities fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const activities = `${buttons}:eq(0)`;

  this.set('click', what => {
    assert.equal(what, 'agenda');
  });
  this.set('show', 'materials');
  this.render(hbs`{{calendar-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(activities).hasClass('active'));
  this.$(activities).click();
});

test('clicking materials fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const materials = `${buttons}:eq(1)`;

  this.set('click', what => {
    assert.equal(what, 'materials');
  });
  this.set('show', 'agenda');
  this.render(hbs`{{calendar-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(materials).hasClass('active'));
  this.$(materials).click();
});

test('clicking activities fires action', function(assert) {
  assert.expect(2);
  const buttons = 'button';
  const calendar = `${buttons}:eq(2)`;

  this.set('click', what => {
    assert.equal(what, 'calendar');
  });
  this.set('show', 'agenda');
  this.render(hbs`{{calendar-view-picker show=show change=(action click)}}`);

  assert.notOk(this.$(calendar).hasClass('active'));
  this.$(calendar).click();
});
