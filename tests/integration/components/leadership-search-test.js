import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | leadership search', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);

    const search = 'input[type="search"]';

    assert.equal(this.$(search).length, 1);
  });


  test('less than 3 charecters triggers warning', async function(assert) {
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
    const search = 'input[type="search"]';
    const results = 'ul';

    this.$(search).val('ab').trigger('keyup');
    return settled().then(()=>{
      assert.equal(this.$(results).text().trim(), 'keep typing...');
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
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:eq(0)`;
    const firstResult = `${results}:eq(1)`;

    this.$(search).val('search words').trigger('keyup');

    return settled().then(()=>{
      assert.equal(this.$(resultsCount).text().trim(), '1 result');
      assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    });
  });

  test('no results displays messages', async function(assert) {
    let storeMock = Service.extend({
      query(what, {q, limit}){

        assert.equal('user', what);
        assert.equal(100, limit);
        assert.equal('search words', q);
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:eq(0)`;

    this.$(search).val('search words').trigger('keyup');


    return settled().then(()=>{
      assert.equal(this.$(resultsCount).text().trim(), 'no results');
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
    this.set('select', user => {
      assert.equal(user1, user);
    });
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action select)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const firstResult = `${results}:eq(1)`;

    this.$(search).val('test').trigger('keyup');

    return settled().then(()=>{
      assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
      this.$(firstResult).click();
    });
  });

  test('can not add users twice', async function(assert) {
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
    this.owner.register('service:store', storeMock);
    this.set('select', (user) => {
      assert.equal(user, user2, 'only user2 should be sent here');
    });
    this.set('existingUsers', [user1]);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action select)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:eq(0)`;
    const firstResult = `${results}:eq(1)`;
    const secondResult = `${results}:eq(2)`;

    await this.$(search).val('test').trigger('keyup');
    await settled();

    assert.equal(this.$(resultsCount).text().trim(), '2 results');
    assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    assert.notOk(this.$(firstResult).hasClass('clickable'));
    assert.equal(this.$(secondResult).text().replace(/[\t\n\s]+/g, ""), 'testperson2testemail2');
    assert.ok(this.$(secondResult).hasClass('clickable'));
    await this.$(firstResult).click();
    await this.$(secondResult).click();
  });
});