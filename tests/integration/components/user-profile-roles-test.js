import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object, Service } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile-roles', 'Integration | Component | user profile roles', {
  integration: true
});
let courseDirectorRole = Object.create({
  title: 'Course Director'
});
let facultyRole = Object.create({
  title: 'Faculty'
});
let developerRole = Object.create({
  title: 'Developer'
});
let formerStudentRole = Object.create({
  title: 'Former Student'
});

let userRoles = [courseDirectorRole];

let user = Object.create({
  enabled: true,
  userSyncIgnore: false,
  roles: resolve(userRoles),
});


test('it renders', function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-roles user=user}}`);
  const courseDirector = '.item:eq(0) span';
  const instructor = '.item:eq(1) span';
  const developer = '.item:eq(2) span';
  const formerStudent = '.item:eq(3) span';
  const disabled = '.item:eq(4) span';
  const syncIgnored = '.item:eq(5) span';

  assert.equal(this.$(courseDirector).text().trim(), 'Yes', 'course director shows status');
  assert.ok(this.$(courseDirector).hasClass('yes'), 'course director has right class');
  assert.equal(this.$(instructor).text().trim(), 'No', 'instructor shows status');
  assert.ok(this.$(instructor).hasClass('no'), 'instructor has right class');
  assert.equal(this.$(developer).text().trim(), 'No', 'developer shows status');
  assert.ok(this.$(developer).hasClass('no'), 'developer has right class');
  assert.equal(this.$(formerStudent).text().trim(), 'No', 'former student shows status');
  assert.ok(this.$(formerStudent).hasClass('no'), 'former student has right class');
  assert.equal(this.$(disabled).text().trim(), 'No', 'disabled shows status');
  assert.ok(this.$(disabled).hasClass('no'), 'disabled has right class');
  assert.equal(this.$(syncIgnored).text().trim(), 'No', 'sync ignored shows status');
  assert.ok(this.$(syncIgnored).hasClass('no'), 'sync ignored has right class');
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
  assert.expect(13);
  let store = Service.extend({
    findAll(){
      return resolve([courseDirectorRole, facultyRole, developerRole, formerStudentRole]);
    }
  });
  this.register('service:store', store);

  this.set('user', user);
  this.set('nothing', parseInt);

  user.set('save', ()=> {
    assert.equal(user.get('enabled'), false, 'user is disabled');
    assert.equal(user.get('userSyncIgnore'), true, 'user is sync ignored');

    assert.notOk(userRoles.contains(courseDirectorRole));
    assert.ok(userRoles.contains(facultyRole));
    assert.ok(userRoles.contains(developerRole));
    assert.ok(userRoles.contains(formerStudentRole));

    return resolve(user);
  });

  this.render(hbs`{{user-profile-roles isManaging=true user=user setIsManaging=(action nothing)}}`);
  let inputs = this.$('input');
  const courseDirector = 'input:eq(0)';
  const instructor = 'input:eq(1)';
  const developer = 'input:eq(2)';
  const formerStudent = 'input:eq(3)';
  const disabled = 'input:eq(4)';
  const syncIgnored = 'input:eq(5)';

  assert.equal(inputs.length, 6);
  assert.ok(this.$(courseDirector).is(':checked'));
  assert.ok(this.$(instructor).not(':checked'));
  assert.ok(this.$(developer).not(':checked'));
  assert.ok(this.$(formerStudent).not(':checked'));
  assert.ok(this.$(disabled).not(':checked'));
  assert.ok(this.$(syncIgnored).not(':checked'));

  this.$(courseDirector).click().change();
  this.$(instructor).click().change();
  this.$(developer).click().change();
  this.$(formerStudent).click().change();
  this.$(disabled).click().change();
  this.$(syncIgnored).click().change();

  this.$('.bigadd').click();

  return wait();
});
