import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import {
  triggerSuccess
} from '../../helpers/ember-cli-clipboard';

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

test('clicking copy displays message', async function(assert) {
  assert.expect(4);
  const iliosConfigMock = Service.extend({
    userSearchType: resolve('ldap')
  });
  this.register('service:iliosConfig', iliosConfigMock);
  this.set('user', user);
  this.render(hbs`{{user-profile-ics user=user}}`);
  const button = 'button.copy-btn';
  const successMessage = '.yes';

  await wait();
  assert.equal(this.$(successMessage).length, 0);
  assert.equal(this.$(button).length, 1);
  triggerSuccess(this, '.copy-btn');
  assert.equal(this.$(successMessage).length, 1);
  assert.equal(this.$(successMessage).text().trim(), 'Copied Successfully');

});
