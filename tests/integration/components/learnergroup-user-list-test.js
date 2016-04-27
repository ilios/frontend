import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object } = Ember;

moduleForComponent('learnergroup-user-list', 'Integration | Component | learnergroup user list', {
  integration: true
});

test('it renders with a list of users', function(assert) {
  let users = [
    {firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'},
    {firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'},
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users setSortBy=(action 'nothing')}}`);
  assert.ok(this.$('tr:eq(0) th:eq(1) i').hasClass('fa-sort-alpha-asc'));
  assert.equal(this.$('tr:eq(0) th:eq(1)').text().trim(), 'First Name');
  assert.equal(this.$('tr:eq(0) th:eq(2)').text().trim(), 'Last Name');
  assert.equal(this.$('tr:eq(0) th:eq(3)').text().trim(), 'Campus ID');
  assert.equal(this.$('tr:eq(0) th:eq(4)').text().trim(), 'Email');

  assert.notOk(this.$('tr:eq(1) td:eq(0) i').hasClass('error'));
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'aaaFirst');
  assert.equal(this.$('tr:eq(1) td:eq(2)').text().trim(), 'aaaLast');
  assert.equal(this.$('tr:eq(1) td:eq(3)').text().trim(), '1234');
  assert.equal(this.$('tr:eq(1) td:eq(4)').text().trim(), 'testemail');

  assert.ok(this.$('tr:eq(2) td:eq(0) i').hasClass('error'));
  assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'bbbFirst');
  assert.equal(this.$('tr:eq(2) td:eq(2)').text().trim(), 'bbbLast');
  assert.equal(this.$('tr:eq(2) td:eq(3)').text().trim(), '12345');
  assert.equal(this.$('tr:eq(2) td:eq(4)').text().trim(), 'testemail2');

});

test('renders with no users', function(assert) {
  let users = [];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users title='test' setSortBy=(action 'nothing')}}`);

  assert.equal(this.$().text().trim(), 'test (0)');
});

test('sort by first name desc', function(assert) {
  let users = [
    {firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'},
    {firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'},
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users sortBy='firstName:desc' setSortBy=(action 'nothing')}}`);
  assert.ok(this.$('tr:eq(0) th:eq(1) i').hasClass('fa-sort-alpha-desc'));
  assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'aaaFirst');
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'bbbFirst');
});

test('sort by last name', function(assert) {
  let users = [
    {firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'},
    {firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'},
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users sortBy='lastName' setSortBy=(action 'nothing')}}`);
  assert.ok(this.$('tr:eq(0) th:eq(2) i').hasClass('fa-sort-alpha-asc'));
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'aaaFirst');
  assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'bbbFirst');
});

test('sort by last name desc', function(assert) {
  let users = [
    {firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'},
    {firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'},
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users sortBy='lastName:desc' setSortBy=(action 'nothing')}}`);
  assert.ok(this.$('tr:eq(0) th:eq(2) i').hasClass('fa-sort-alpha-desc'));
  assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'aaaFirst');
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'bbbFirst');
});

test('clicking lastname sends action', function(assert) {
  let users = [
    {},
  ];

  this.set('users', users);
  this.on('setSortBy', function(what){
    assert.equal(what, 'lastName');
  });
  this.render(hbs`{{learnergroup-user-list users=users setSortBy=(action 'setSortBy')}}`);
  this.$('tr:eq(0) th:eq(2) i').click();
});

test('sort reverses when clicked again', function(assert) {
  let users = [
    {},
  ];

  this.set('users', users);
  this.on('setSortBy', function(what){
    assert.equal(what, 'firstName:desc');
  });
  this.render(hbs`{{learnergroup-user-list users=users setSortBy=(action 'setSortBy')}}`);
  this.$('tr:eq(0) th:eq(1) i').click();
});

test('filter works on first name', function(assert) {
  let users = [
    Object.create({firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'}),
    Object.create({firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'}),
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users sortBy='lastName' setSortBy=(action 'nothing')}}`);
  this.$('.detail-actions input').val('aaaFirst');
  this.$('.detail-actions input').trigger('change');

  assert.equal(this.$('tbody tr').length, 1);
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'aaaFirst');
});

test('filter works on last name', function(assert) {
  let users = [
    Object.create({firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'}),
    Object.create({firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'}),
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users sortBy='lastName' setSortBy=(action 'nothing')}}`);
  this.$('.detail-actions input').val('bbbLast');
  this.$('.detail-actions input').trigger('change');

  assert.equal(this.$('tbody tr').length, 1);
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'bbbFirst');
});

test('filter works on email', function(assert) {
  let users = [
    Object.create({firstName: 'aaaFirst', lastName: 'aaaLast', enabled: true, campusId: 1234, email: 'testemail'}),
    Object.create({firstName: 'bbbFirst', lastName: 'bbbLast', enabled: false, campusId: 12345, email: 'testemail2'}),
  ];

  this.set('users', users);
  this.on('nothing', parseInt);
  this.render(hbs`{{learnergroup-user-list users=users sortBy='lastName' setSortBy=(action 'nothing')}}`);
  this.$('.detail-actions input').val('testemail2');
  this.$('.detail-actions input').trigger('change');

  assert.equal(this.$('tbody tr').length, 1);
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'bbbFirst');
});
