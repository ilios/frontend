import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | leadership search', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);

    const search = 'input[type="search"]';

    assert.equal(findAll(search).length, 1);
  });


  test('less than 3 charecters triggers warning', async function(assert) {
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
    const search = 'input[type="search"]';
    const results = 'ul';

    await fillIn(search, 'ab');
    assert.equal(find(results).textContent.trim(), 'keep typing...');

  });

  test('input triggers search', async function (assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail'
    });
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:nth-of-type(1)`;
    const firstResult = `${results}:nth-of-type(2)`;

    await fillIn(search, 'test person');
    assert.equal(find(resultsCount).textContent.trim(), '1 result');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ""), 'testM.persontestemail');
  });

  test('no results displays messages', async function(assert) {
    this.set('nothing', parseInt);
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action nothing)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:nth-of-type(1)`;

    await fillIn(search, 'search words');
    assert.equal(find(resultsCount).textContent.trim(), 'no results');
  });

  test('click user fires add user', async function(assert) {
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail'
    });
    this.set('select', user => {
      assert.equal(1, user.id);
    });
    this.set('existingUsers', []);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action select)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const firstResult = `${results}:nth-of-type(2)`;

    await fillIn(search, 'test');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ""), 'testM.persontestemail');
    await click(firstResult);
  });

  test('can not add users twice', async function(assert) {
    assert.expect(6);
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person',
      email: 'testemail'
    });
    this.server.create('user', {
      firstName: 'test',
      lastName: 'person2',
      email: 'testemail2'
    });
    this.set('select', (user) => {
      assert.equal(user.id, 2, 'only user2 should be sent here');
    });
    const user1 = run(() => this.owner.lookup('service:store').find('user', 1));

    this.set('existingUsers', [user1]);
    await render(hbs`{{leadership-search existingUsers=existingUsers selectUser=(action select)}}`);
    const search = 'input[type="search"]';
    const results = 'ul li';
    const resultsCount = `${results}:nth-of-type(1)`;
    const firstResult = `${results}:nth-of-type(2)`;
    const secondResult = `${results}:nth-of-type(3)`;

    await fillIn(search, 'test');

    assert.equal(find(resultsCount).textContent.trim(), '2 results');
    assert.equal(find(firstResult).textContent.replace(/[\t\n\s]+/g, ""), 'testM.persontestemail');
    assert.notOk(find(firstResult).classList.contains('clickable'));
    assert.equal(find(secondResult).textContent.replace(/[\t\n\s]+/g, ""), 'testM.person2testemail2');
    assert.ok(find(secondResult).classList.contains('clickable'));
    await click(firstResult);
    await click(secondResult);
  });
});
