import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('user-profile-bio', 'Integration | Component | user profile bio', {
  integration: true
});

let user = Object.create({
  fullName: 'Test Person Name Thing',
  firstName: 'Test Person',
  middleName: 'Name',
  lastName: 'Thing',
  campusId: 'idC',
  otherId: 'idO',
  email: 'test@test.com',
  phone: 'x1234',
  roles: resolve([]),
  cohorts: resolve([]),
  primaryCohort: resolve(null),
});


test('it renders', function(assert) {
  this.set('user', user);
  this.render(hbs`{{user-profile-bio user=user}}`);
  const firstName = '.item:eq(0) span';
  const middleName = '.item:eq(1) span';
  const lastName = '.item:eq(2) span';
  const campusId = '.item:eq(3) span';
  const otherId = '.item:eq(4) span';
  const email = '.item:eq(5) span';
  const phone = '.item:eq(6) span';

  assert.equal(this.$(firstName).text().trim(), 'Test Person', 'first name is displayed');
  assert.equal(this.$(middleName).text().trim(), 'Name', 'middle name is displayed');
  assert.equal(this.$(lastName).text().trim(), 'Thing', 'last name is displayed');
  assert.equal(this.$(campusId).text().trim(), 'idC', 'campus Id is displayed');
  assert.equal(this.$(otherId).text().trim(), 'idO', 'other id is displayed');
  assert.equal(this.$(email).text().trim(), 'test@test.com', 'email is displayed');
  assert.equal(this.$(phone).text().trim(), 'x1234', 'phone is displayed');
});

test('clicking manage sends the action', function(assert) {
  assert.expect(1);
  this.set('user', user);
  this.set('click', (what) =>{
    assert.ok(what, 'recieved boolean true value');
  });
  this.render(hbs`{{user-profile-bio user=user isManagable=true setIsManaging=(action click)}}`);
  const manage = 'button.manage';
  this.$(manage).click();
});

test('can edit user bio', function(assert) {
  assert.expect(15);
  this.set('user', user);
  this.set('nothing', parseInt);

  user.set('save', ()=> {
    assert.equal(user.get('firstName'), 'new first', 'first name is saved');
    assert.equal(user.get('middleName'), 'new middle', 'middel is saved');
    assert.equal(user.get('lastName'), 'new last', 'last is saved');
    assert.equal(user.get('campusId'), 'new campusId', 'campusId is saved');
    assert.equal(user.get('otherId'), 'new otherId', 'otherId is saved');
    assert.equal(user.get('email'), 'e@e.com', 'email is saved');
    assert.equal(user.get('phone'), '12345x', 'phone is saved');

    return resolve(user);
  });

  this.render(hbs`{{user-profile-bio isManaging=true user=user setIsManaging=(action nothing)}}`);
  let inputs = this.$('input');
  const firstName = 'input:eq(0)';
  const middleName = 'input:eq(1)';
  const lastName = 'input:eq(2)';
  const campusId = 'input:eq(3)';
  const otherId = 'input:eq(4)';
  const email = 'input:eq(5)';
  const phone = 'input:eq(6)';

  assert.equal(inputs.length, 7);
  assert.equal(this.$(firstName).val().trim(), 'Test Person');
  assert.equal(this.$(middleName).val().trim(), 'Name');
  assert.equal(this.$(lastName).val().trim(), 'Thing');
  assert.equal(this.$(campusId).val().trim(), 'idC');
  assert.equal(this.$(otherId).val().trim(), 'idO');
  assert.equal(this.$(email).val().trim(), 'test@test.com');
  assert.equal(this.$(phone).val().trim(), 'x1234');
  this.$(firstName).val('new first').change();
  this.$(middleName).val('new middle').change();
  this.$(lastName).val('new last').change();
  this.$(campusId).val('new campusId').change();
  this.$(otherId).val('new otherId').change();
  this.$(email).val('e@e.com').change();
  this.$(phone).val('12345x').change();
  this.$('.bigadd').click();

  return wait();
});
