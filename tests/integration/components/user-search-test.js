import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('user-search', 'Integration | Component | user search', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{user-search}}`);

  assert.equal(this.$('input').length, 1);
});

test('less than 3 charecters triggers warning', function(assert) {
  this.render(hbs`{{user-search}}`);

  this.$('input').val('ab').trigger('input');
  return wait().then(()=>{
    assert.equal(this.$('ul').text().trim(), 'keep typing...');
  });
});

test('input triggers search', function(assert) {
  let storeMock = Service.extend({
    query(what, {q, limit}){

      assert.equal('user', what);
      assert.equal(100, limit);
      assert.equal('search words', q);
      return resolve([EmberObject.create({fullName: 'test person', email: 'testemail'})]);
    }
  });
  this.register('service:store', storeMock);
  this.render(hbs`{{user-search}}`);

  this.$('input').val('search words').trigger('input');

  return wait().then(()=>{
    assert.equal(this.$('li:eq(0)').text().trim(), '1 Results');
    assert.equal(this.$('li:eq(1)').text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
  });
});

test('no results displayes messages', function(assert) {
  let storeMock = Service.extend({
    query(what, {q, limit}){

      assert.equal('user', what);
      assert.equal(100, limit);
      assert.equal('search words', q);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);
  this.render(hbs`{{user-search}}`);

  this.$('input').val('search words').trigger('input');


  return wait().then(()=>{
    assert.equal(this.$('li:eq(0)').text().trim(), 'no results');
  });
});

test('search for groups', function(assert) {
  let storeMock = Service.extend({
    query(){
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);
  let group1 = EmberObject.create({
    title: 'test1'
  });
  let group2 = EmberObject.create({
    title: 'test2'
  });
  this.set('availableInstructorGroups', [group1, group2]);
  this.render(hbs`{{user-search availableInstructorGroups=availableInstructorGroups}}`);

  this.$('input').val('test').trigger('input');

  return wait().then(()=>{
    assert.equal(this.$('li:eq(0)').text().trim(), '2 Results');
    assert.equal(this.$('li:eq(1)').text().trim(), 'test1');
    assert.equal(this.$('li:eq(2)').text().trim(), 'test2');
  });
});

test('click user fires add user', function(assert) {
  let user1 = EmberObject.create({
    fullName: 'test person',
    email: 'testemail'
  });
  let storeMock = Service.extend({
    query(){
      return resolve([user1]);
    }
  });
  this.register('service:store', storeMock);

  this.on('action', function(user){
    assert.equal(user1, user);
  });
  this.render(hbs`{{user-search addUser=(action 'action')}}`);

  this.$('input').val('test').trigger('input');

  return wait().then(()=>{
    assert.equal(this.$('li:eq(1)').text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    this.$('li:eq(1)').click();
  });
});

test('click group fires add group', function(assert) {
  let storeMock = Service.extend({
    query(){
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let group1 = EmberObject.create({
    title: 'test1'
  });
  this.on('action', function(group){
    assert.equal(group1, group);
  });
  this.set('availableInstructorGroups', [group1]);
  this.render(hbs`{{user-search availableInstructorGroups=availableInstructorGroups addInstructorGroup=(action 'action')}}`);

  this.$('input').val('test').trigger('input');

  return wait().then(()=>{
    assert.equal(this.$('li:eq(1)').text().trim(), 'test1');
    this.$('li:eq(1)').click();
  });
});

test('sorting is natural', async function(assert) {
  let user1 = EmberObject.create({
    fullName: 'person 20',
    email: ''
  });
  let user2 = EmberObject.create({
    fullName: 'person 10',
    email: ''
  });
  let user3 = EmberObject.create({
    fullName: 'person 3',
    email: ''
  });
  let user4 = EmberObject.create({
    fullName: 'person',
    email: ''
  });
  let storeMock = Service.extend({
    query(){
      return resolve([user1, user2, user3, user4]);
    }
  });
  this.register('service:store', storeMock);

  this.render(hbs`{{user-search}}`);

  this.$('input').val('person').trigger('input');

  await wait();
  const items = '.results li';
  const first = `${items}:eq(0)`;
  const second = `${items}:eq(1)`;
  const third = `${items}:eq(2)`;
  const fourth = `${items}:eq(3)`;
  const fifth = `${items}:eq(4)`;

  assert.equal(this.$(first).text().trim(), '4 Results');
  assert.equal(this.$(second).text().trim(), 'person');
  assert.equal(this.$(third).text().trim(), 'person 3');
  assert.equal(this.$(fourth).text().trim(), 'person 10');
  assert.equal(this.$(fifth).text().trim(), 'person 20');
});
