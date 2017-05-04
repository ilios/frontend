import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object:EmberObject, Service } = Ember;
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
let courseDirectorRole = EmberObject.create({
  title: 'Course Director'
});
let facultyRole = EmberObject.create({
  title: 'Faculty'
});
let developerRole = EmberObject.create({
  title: 'Developer'
});
let formerStudentRole = EmberObject.create({
  title: 'Former Student'
});
let studentRole = EmberObject.create({
  title: 'Student'
});

let userRoles = [courseDirectorRole, studentRole];




test('it renders', function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-roles user=user}}`);
  const courseDirector = '.item:eq(0) span';
  const instructor = '.item:eq(1) span';
  const developer = '.item:eq(2) span';
  const formerStudent = '.item:eq(3) span';
  const enabled = '.item:eq(4) span';
  const syncIgnored = '.item:eq(5) span';

  return wait().then(()=>{
    assert.equal(this.$(courseDirector).text().trim(), 'Yes', 'course director shows status');
    assert.ok(this.$(courseDirector).hasClass('yes'), 'course director has right class');
    assert.equal(this.$(instructor).text().trim(), 'No', 'instructor shows status');
    assert.ok(this.$(instructor).hasClass('no'), 'instructor has right class');
    assert.equal(this.$(developer).text().trim(), 'No', 'developer shows status');
    assert.ok(this.$(developer).hasClass('no'), 'developer has right class');
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
  this.render(hbs`{{user-profile-roles user=user isManagable=true setIsManaging=(action click)}}`);
  const manage = 'button.manage';
  this.$(manage).click();
});

test('can edit user roles', function(assert) {
  assert.expect(14);
  let store = Service.extend({
    findAll(){
      return resolve([courseDirectorRole, facultyRole, developerRole, formerStudentRole, studentRole]);
    }
  });
  this.register('service:store', store);

  this.set('user', user);
  this.set('nothing', parseInt);

  user.set('save', ()=> {
    assert.equal(user.get('enabled'), false, 'user is disabled');
    assert.equal(user.get('userSyncIgnore'), true, 'user is sync ignored');

    assert.notOk(userRoles.includes(courseDirectorRole));
    assert.ok(userRoles.includes(facultyRole));
    assert.ok(userRoles.includes(developerRole));
    assert.ok(userRoles.includes(formerStudentRole));
    assert.ok(userRoles.includes(studentRole));

    return resolve(user);
  });

  this.render(hbs`{{user-profile-roles isManaging=true user=user setIsManaging=(action nothing)}}`);
  let inputs = this.$('input');
  const courseDirector = 'input:eq(0)';
  const instructor = 'input:eq(1)';
  const developer = 'input:eq(2)';
  const formerStudent = 'input:eq(3)';
  const enabled = 'input:eq(4)';
  const syncIgnored = 'input:eq(5)';

  return wait().then(()=>{
    assert.equal(inputs.length, 6);
    assert.ok(this.$(courseDirector).is(':checked'));
    assert.ok(this.$(instructor).not(':checked'));
    assert.ok(this.$(developer).not(':checked'));
    assert.ok(this.$(formerStudent).not(':checked'));
    assert.ok(this.$(enabled).is(':checked'));
    assert.ok(this.$(syncIgnored).not(':checked'));

    this.$(courseDirector).click().change();
    this.$(instructor).click().change();
    this.$(developer).click().change();
    this.$(formerStudent).click().change();
    this.$(enabled).click().change();
    this.$(syncIgnored).click().change();

    this.$('.bigadd').click();

    return wait();
  });
});
