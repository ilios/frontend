import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

let user;
moduleForComponent('user-profile-roles', 'Integration | Component | user profile roles', {
  integration: true,
  beforeEach(){
    user = EmberObject.create({
      id: 6,
      enabled: true,
      userSyncIgnore: false,
      roles: resolve(userRoles),
    });
  }
});
let formerStudentRole = EmberObject.create({
  title: 'Former Student'
});
let studentRole = EmberObject.create({
  title: 'Student'
});

let userRoles = [studentRole];

test('it renders', function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-roles user=user}}`);
  const student = '.item:eq(0) span';
  const formerStudent = '.item:eq(1) span';
  const enabled = '.item:eq(2) span';
  const syncIgnored = '.item:eq(3) span';

  return wait().then(()=>{
    assert.equal(this.$(student).text().trim(), 'Yes', 'student shows status');
    assert.equal(this.$(formerStudent).text().trim(), 'No', 'former student shows status');
    assert.ok(this.$(formerStudent).hasClass('no'), 'former student has right class');
    assert.equal(this.$(enabled).text().trim(), 'Yes', 'enabled shows status');
    assert.ok(this.$(enabled).hasClass('yes'), 'enabled has right class');
    assert.equal(this.$(syncIgnored).text().trim(), 'No', 'sync ignored shows status');
    assert.ok(this.$(syncIgnored).hasClass('no'), 'sync ignored has right class');
  });
});

test('clicking manage sends the action', function(assert) {
  assert.expect(1);
  this.set('user', user);
  this.set('click', (what) =>{
    assert.ok(what, 'recieved boolean true value');
  });
  this.render(hbs`{{user-profile-roles user=user isManageable=true setIsManaging=(action click)}}`);
  const manage = 'button.manage';
  this.$(manage).click();
});

test('can edit user roles', function(assert) {
  assert.expect(8);
  let store = Service.extend({
    findAll(){
      return resolve([formerStudentRole, studentRole]);
    }
  });
  this.register('service:store', store);

  this.set('user', user);
  this.set('nothing', parseInt);

  user.set('save', ()=> {
    assert.equal(user.get('enabled'), false, 'user is disabled');
    assert.equal(user.get('userSyncIgnore'), true, 'user is sync ignored');

    assert.ok(userRoles.includes(formerStudentRole));
    assert.ok(userRoles.includes(studentRole));

    return resolve(user);
  });

  this.render(hbs`{{user-profile-roles isManaging=true user=user setIsManaging=(action nothing)}}`);
  let inputs = this.$('input');
  const formerStudent = 'input:eq(0)';
  const enabled = 'input:eq(1)';
  const syncIgnored = 'input:eq(2)';

  return wait().then(()=>{
    assert.equal(inputs.length, 3);
    assert.ok(this.$(formerStudent).not(':checked'));
    assert.ok(this.$(enabled).is(':checked'));
    assert.ok(this.$(syncIgnored).not(':checked'));

    this.$(formerStudent).click().change();
    this.$(enabled).click().change();
    this.$(syncIgnored).click().change();

    this.$('.bigadd').click();

    return wait();
  });
});
