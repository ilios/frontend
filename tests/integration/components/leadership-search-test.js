import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Service, RSVP, Object:EmberObject } = Ember;
const { resolve } = RSVP;

moduleForComponent('leadership-search', 'Integration | Component | leadership search', {
  integration: true
});

test('it renders', function(assert) {
  this.set('nothing', parseInt);
  this.set('existingUsers', []);
  this.render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);

  const search = 'input[type="search"]';

  assert.equal(this.$(search).length, 1);
});


test('less than 3 charecters triggers warning', function(assert) {
  this.set('nothing', parseInt);
  this.set('existingUsers', []);
  this.render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
  const search = 'input[type="search"]';
  const results = 'ul';

  this.$(search).val('ab').trigger('keyup');
  return wait().then(()=>{
    assert.equal(this.$(results).text().trim(), 'keep typing...');
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
  this.set('nothing', parseInt);
  this.set('existingUsers', []);
  this.render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
  const search = 'input[type="search"]';
  const results = 'ul li';
  const resultsCount = `${results}:eq(0)`;
  const firstResult = `${results}:eq(1)`;

  this.$(search).val('search words').trigger('keyup');

  return wait().then(()=>{
    assert.equal(this.$(resultsCount).text().trim(), '1 result');
    assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
  });
});

test('no results displays messages', function(assert) {
  let storeMock = Service.extend({
    query(what, {q, limit}){

      assert.equal('user', what);
      assert.equal(100, limit);
      assert.equal('search words', q);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);
  this.set('nothing', parseInt);
  this.set('existingUsers', []);
  this.render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
  const search = 'input[type="search"]';
  const results = 'ul li';
  const resultsCount = `${results}:eq(0)`;

  this.$(search).val('search words').trigger('keyup');


  return wait().then(()=>{
    assert.equal(this.$(resultsCount).text().trim(), 'no results');
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
  this.set('select', user => {
    assert.equal(user1, user);
  });
  this.set('existingUsers', []);
  this.render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action select)}}`);
  const search = 'input[type="search"]';
  const results = 'ul li';
  const firstResult = `${results}:eq(1)`;

  this.$(search).val('test').trigger('keyup');

  return wait().then(()=>{
    assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    this.$(firstResult).click();
  });
});

test('can not add users twice', function(assert) {
  assert.expect(6);
  let user1 = EmberObject.create({
    id: 1,
    fullName: 'test person',
    email: 'testemail'
  });
  let user2 = EmberObject.create({
    id: 2,
    fullName: 'test person2',
    email: 'testemail2'
  });
  let storeMock = Service.extend({
    query(){
      return resolve([user1, user2]);
    }
  });
  this.register('service:store', storeMock);
  this.set('select', (user) => {
    assert.equal(user, user2, 'only user2 should be sent here');
  });
  this.set('existingUsers', [user1]);
  this.render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action select)}}`);
  const search = 'input[type="search"]';
  const results = 'ul li';
  const resultsCount = `${results}:eq(0)`;
  const firstResult = `${results}:eq(1)`;
  const secondResult = `${results}:eq(2)`;

  this.$(search).val('test').trigger('keyup');

  return wait().then(()=>{
    assert.equal(this.$(resultsCount).text().trim(), '2 results');
    assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    assert.notOk(this.$(firstResult).hasClass('clickable'));
    assert.equal(this.$(secondResult).text().replace(/[\t\n\s]+/g, ""), 'testperson2testemail2');
    assert.ok(this.$(secondResult).hasClass('clickable'));
    this.$(firstResult).click();
    this.$(secondResult).click();
  });
});
