import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('leadership-manager', 'Integration | Component | leadership manager', {
  integration: true
});

test('it renders with data', function(assert) {
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

  this.render(hbs`{{leadership-manager
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

test('it renders without data', function(assert) {
  assert.expect(2);
  this.set('directors', []);
  this.set('administrators', []);
  this.set('nothing', parseInt);

  this.render(hbs`{{leadership-manager
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

test('it remove director', function(assert) {
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

  this.render(hbs`{{leadership-manager
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

test('it remove administrator', function(assert) {
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

  this.render(hbs`{{leadership-manager
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

test('add director', function(assert) {
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
  this.register('service:store', storeMock);
  this.set('directors', []);
  this.set('administrators', [user1]);
  this.set('nothing', parseInt);
  this.set('add', (who) => {
    assert.equal(who, user1, 'user passed correctly from action');
    this.set('directors', [who]);
  });

  this.render(hbs`{{leadership-manager
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

  return wait().then(()=>{
    assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    this.$(firstResult).click();
    return wait().then(()=>{
      assert.equal(this.$(directorsList).length, 1);
      assert.equal(this.$(administratorsList).length, 1);
    });
  });
});

test('add administrator', function(assert) {
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
  this.register('service:store', storeMock);
  this.set('directors', [user1]);
  this.set('administrators', []);
  this.set('nothing', parseInt);
  this.set('add', (who) => {
    assert.equal(who, user1, 'user passed correctly from action');
    this.set('administrators', [who]);
  });

  this.render(hbs`{{leadership-manager
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

  return wait().then(()=>{
    assert.equal(this.$(firstResult).text().replace(/[\t\n\s]+/g, ""), 'testpersontestemail');
    this.$(firstResult).click();
    return wait().then(()=>{
      assert.equal(this.$(directorsList).length, 1);
      assert.equal(this.$(administratorsList).length, 1);
    });
  });
});

test('disabled users are indicated with an icon', function(assert) {
  assert.expect(7);
  let user1 = EmberObject.create({
    enabled: true,
    firstName: 'a',
    lastName: 'person',
    fullName: 'a b person',
  });
  let user2 = EmberObject.create({
    enabled: false,
    firstName: 'b',
    lastName: 'person',
    fullName: 'b a person',
  });
  this.set('directors', [user1]);
  this.set('administrators', [user2, user1]);
  this.set('nothing', parseInt);

  this.render(hbs`{{leadership-manager
    directors=directors
    administrators=administrators
    removeDirector=(action nothing)
    addDirector=(action nothing)
    removeAdministrator=(action nothing)
    addAdministrator=(action nothing)
  }}`);
  const directors = 'table tbody tr:eq(0) td:eq(0) li';
  const administrators = 'table tbody tr:eq(0) td:eq(1) li';
  const disabledDirectors = `${directors} .fa-user-times`;
  const disabledAdministrators = `${administrators} .fa-user-times`;

  assert.equal(this.$(directors).length, 1);
  assert.equal(this.$(disabledDirectors).length, 0);
  assert.equal(this.$(directors).eq(0).text().trim(), 'a b person');
  assert.equal(this.$(administrators).length, 2);
  assert.equal(this.$(disabledAdministrators).length, 1);
  assert.equal(this.$(administrators).eq(0).text().trim(), 'a b person');
  assert.equal(this.$(administrators).eq(1).text().trim(), 'b a person');
});
