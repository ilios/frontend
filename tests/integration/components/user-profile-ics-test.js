import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { RSVP, Object:EmberObject, Service } = Ember;
const { resolve } = RSVP;
let user;
moduleForComponent('user-profile-ics', 'Integration | Component | user profile ics', {
  integration: true,
  beforeEach(){
    user = EmberObject.create({
      id: 13,
      icsFeedKey: 'testkey'
    });
    const serverVariablesMock = Service.extend({
      apiHost: 'http://myhost.com'
    });
    this.register('service:serverVariables', serverVariablesMock);
  }
});

test('it renders', function(assert) {

  this.set('user', user);
  this.render(hbs`{{user-profile-ics user=user}}`);
  const linkBox = '.ics-link';
  const link = `${linkBox} a:eq(0)`;

  return wait().then(()=>{
    assert.equal(this.$(linkBox).text().trim(), 'Web Link', 'link text is correct');
    assert.equal(this.$(link).attr('href'), 'http://myhost.com/ics/testkey', 'feed link is correct');
  });
});

test('clicking manage sends the action', function(assert) {
  const iliosConfigMock = Service.extend({
    userSearchType: resolve('ldap')
  });
  this.register('service:iliosConfig', iliosConfigMock);
  assert.expect(1);
  this.set('user', user);
  this.set('click', (what) =>{
    assert.ok(what, 'recieved boolean true value');
  });
  this.render(hbs`{{user-profile-ics user=user isManagable=true setIsManaging=(action click)}}`);
  return wait().then(()=>{
    const manage = 'button.manage';
    this.$(manage).click();
  });
});

test('can refresh key', function(assert) {
  assert.expect(2);
  this.set('user', user);
  this.set('nothing', parseInt);

  user.set('save', ()=> {
    const icsFeedKey = user.get('icsFeedKey');
    assert.notEqual(icsFeedKey, 'testkey', 'icsFeedKey is not the same');
    assert.equal(icsFeedKey.length, 64, 'icsFeedKey is a long string probably a hash');

    return resolve(user);
  });

  this.render(hbs`{{user-profile-ics isManaging=true user=user setIsManaging=(action nothing)}}`);

  return wait().then(()=>{
    this.$('.refresh-key').click();

    return wait();
  });
});
