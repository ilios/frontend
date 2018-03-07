import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, click, fillIn, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | user search', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    await render(hbs`{{user-search}}`);

    assert.equal(findAll('input').length, 1);
  });

  test('less than 3 charecters triggers warning', async function(assert) {
    await render(hbs`{{user-search}}`);

    await fillIn('input', 'ab');
    return settled().then(()=>{
      assert.equal(find('ul').textContent.trim(), 'keep typing...');
    });
  });

  test('input triggers search', async function(assert) {
    let storeMock = Service.extend({
      query(what, {q, limit}){

        assert.equal('user', what);
        assert.equal(100, limit);
        assert.equal('search words', q);
        return resolve([EmberObject.create({fullName: 'test person', email: 'testemail'})]);
      }
    });
    this.owner.register('service:store', storeMock);
    await render(hbs`{{user-search}}`);

    await fillIn('input', 'search words');

    return settled().then(()=>{
      assert.equal(find('li').textContent.trim(), '1 Results');
      assert.equal(find(findAll('li')[1]).textContent.replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    });
  });

  test('no results displayes messages', async function(assert) {
    let storeMock = Service.extend({
      query(what, {q, limit}){

        assert.equal('user', what);
        assert.equal(100, limit);
        assert.equal('search words', q);
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
    await render(hbs`{{user-search}}`);

    await fillIn('input', 'search words');


    return settled().then(()=>{
      assert.equal(find('li').textContent.trim(), 'no results');
    });
  });

  test('search for groups', async function(assert) {
    let storeMock = Service.extend({
      query(){
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
    let group1 = EmberObject.create({
      title: 'test1'
    });
    let group2 = EmberObject.create({
      title: 'test2'
    });
    this.set('availableInstructorGroups', [group1, group2]);
    await render(hbs`{{user-search availableInstructorGroups=availableInstructorGroups}}`);

    await fillIn('input', 'test');

    return settled().then(()=>{
      assert.equal(find('li').textContent.trim(), '2 Results');
      assert.equal(find(findAll('li')[1]).textContent.trim(), 'test1');
      assert.equal(find(findAll('li')[2]).textContent.trim(), 'test2');
    });
  });

  test('click user fires add user', async function(assert) {
    let user1 = EmberObject.create({
      fullName: 'test person',
      email: 'testemail'
    });
    let storeMock = Service.extend({
      query(){
        return resolve([user1]);
      }
    });
    this.owner.register('service:store', storeMock);

    this.actions.action = function(user){
      assert.equal(user1, user);
    };
    await render(hbs`{{user-search addUser=(action 'action')}}`);

    await fillIn('input', 'test');

    return settled().then(async () => {
      assert.equal(find(findAll('li')[1]).textContent.replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
      await click(findAll('li')[1]);
    });
  });

  test('click group fires add group', async function(assert) {
    let storeMock = Service.extend({
      query(){
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);

    let group1 = EmberObject.create({
      title: 'test1'
    });
    this.actions.action = function(group){
      assert.equal(group1, group);
    };
    this.set('availableInstructorGroups', [group1]);
    await render(
      hbs`{{user-search availableInstructorGroups=availableInstructorGroups addInstructorGroup=(action 'action')}}`
    );

    await fillIn('input', 'test');

    return settled().then(async () => {
      assert.equal(find(findAll('li')[1]).textContent.trim(), 'test1');
      await click(findAll('li')[1]);
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
    this.owner.register('service:store', storeMock);

    await render(hbs`{{user-search}}`);

    await fillIn('input', 'person');

    await settled();
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
});
