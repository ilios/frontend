import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | leadership manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with data', async function(assert) {
    assert.expect(5);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    let user2 = EmberObject.create({
      firstName: 'b',
      lastName: 'person',
      fullName: 'b a person',
    });
    this.set('directors', [user1]);
    this.set('administrators', [user2, user1]);
    this.set('nothing', parseInt);

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directors = 'table tbody tr:eq(0) td:eq(0) li';
    const administrators = 'table tbody tr:eq(0) td:eq(1) li';

    assert.equal(this.$(directors).length, 1);
    assert.equal(this.$(directors).eq(0).text().trim(), 'a b person');
    assert.equal(this.$(administrators).length, 2);
    assert.equal(this.$(administrators).eq(0).text().trim(), 'a b person');
    assert.equal(this.$(administrators).eq(1).text().trim(), 'b a person');
  });

  test('it renders without data', async function(assert) {
    assert.expect(2);
    this.set('directors', []);
    this.set('administrators', []);
    this.set('nothing', parseInt);

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directors = 'table tbody tr:eq(0) td:eq(0) li';
    const administrators = 'table tbody tr:eq(0) td:eq(1) li';

    assert.equal(this.$(directors).length, 0);
    assert.equal(this.$(administrators).length, 0);
  });

  test('it remove director', async function(assert) {
    assert.expect(3);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    this.set('directors', [user1]);
    this.set('administrators', []);
    this.set('nothing', parseInt);
    this.set('remove', (who) => {
      assert.equal(who, user1);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action remove)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const list = 'table tbody tr:eq(0) td:eq(0) li';
    const icon = `${list}:eq(0) i`;

    assert.equal(this.$(list).length, 1);
    assert.equal(this.$(list).eq(0).text().trim(), 'a b person');
    this.$(icon).click();
  });

  test('it remove administrator', async function(assert) {
    assert.expect(3);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    this.set('directors', []);
    this.set('administrators', [user1]);
    this.set('nothing', parseInt);
    this.set('remove', (who) => {
      assert.equal(who, user1);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action remove)
      addAdministrator=(action nothing)
    }}`);
    const list = 'table tbody tr:eq(0) td:eq(1) li';
    const icon = `${list}:eq(0) i`;

    assert.equal(this.$(list).length, 1);
    assert.equal(this.$(list).eq(0).text().trim(), 'a b person');
    this.$(icon).click();
  });

  test('add director', async function(assert) {
    assert.expect(6);
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
    this.set('directors', []);
    this.set('administrators', [user1]);
    this.set('nothing', parseInt);
    this.set('add', (who) => {
      assert.equal(who, user1, 'user passed correctly from action');
      this.set('directors', [who]);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action add)
      removeAdministrator=(action nothing)
      addAdministrator=(action nothing)
    }}`);
    const directorsList = 'table tbody tr:eq(0) td:eq(0) li';
    const administratorsList = 'table tbody tr:eq(0) td:eq(1) li';
    const directorSearch = 'input[type="search"]:eq(0)';
    const results = '.results:eq(0) li';
    const firstResult = `${results}:eq(1)`;

    assert.equal(this.$(directorsList).length, 0);
    assert.equal(this.$(administratorsList).length, 1);

    this.$(directorSearch).val('test').trigger('keyup');

    return settled().then(()=>{
      assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
      this.$(firstResult).click();
      return settled().then(()=>{
        assert.equal(this.$(directorsList).length, 1);
        assert.equal(this.$(administratorsList).length, 1);
      });
    });
  });

  test('add administrator', async function(assert) {
    assert.expect(6);
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
    this.set('directors', [user1]);
    this.set('administrators', []);
    this.set('nothing', parseInt);
    this.set('add', (who) => {
      assert.equal(who, user1, 'user passed correctly from action');
      this.set('administrators', [who]);
    });

    await render(hbs`{{leadership-manager
      directors=directors
      administrators=administrators
      removeDirector=(action nothing)
      addDirector=(action nothing)
      removeAdministrator=(action nothing)
      addAdministrator=(action add)
    }}`);
    const directorsList = 'table tbody tr:eq(0) td:eq(0) li';
    const administratorsList = 'table tbody tr:eq(0) td:eq(1) li';
    const administratorSearch = 'input[type="search"]:eq(1)';
    const results = '.results:eq(1) li';
    const firstResult = `${results}:eq(1)`;

    assert.equal(this.$(directorsList).length, 1);
    assert.equal(this.$(administratorsList).length, 0);

    this.$(administratorSearch).val('test').trigger('keyup');

    return settled().then(()=>{
      assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
      this.$(firstResult).click();
      return settled().then(()=>{
        assert.equal(this.$(directorsList).length, 1);
        assert.equal(this.$(administratorsList).length, 1);
      });
    });
  });
});