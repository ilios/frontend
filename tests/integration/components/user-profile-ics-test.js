import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import {
  triggerSuccess
} from '../../helpers/ember-cli-clipboard';

const { resolve } = RSVP;
let user;

module('Integration | Component | user profile ics', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    user = EmberObject.create({
      id: 13,
      icsFeedKey: 'testkey'
    });
    const serverVariablesMock = Service.extend({
      apiHost: 'http://myhost.com'
    });
    this.owner.register('service:serverVariables', serverVariablesMock);
  });

  test('clicking manage sends the action', async function(assert) {
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    assert.expect(1);
    this.set('user', user);
    this.set('click', (what) =>{
      assert.ok(what, 'recieved boolean true value');
    });
    await render(hbs`{{user-profile-ics user=user isManagable=true setIsManaging=(action click)}}`);
    return settled().then(()=>{
      const manage = 'button.manage';
      this.$(manage).click();
    });
  });

  test('can refresh key', async function(assert) {
    assert.expect(2);
    this.set('user', user);
    this.set('nothing', parseInt);

    user.set('save', ()=> {
      const icsFeedKey = user.get('icsFeedKey');
      assert.notEqual(icsFeedKey, 'testkey', 'icsFeedKey is not the same');
      assert.equal(icsFeedKey.length, 64, 'icsFeedKey is a long string probably a hash');

      return resolve(user);
    });

    await render(hbs`{{user-profile-ics isManaging=true user=user setIsManaging=(action nothing)}}`);

    return settled().then(()=>{
      this.$('.refresh-key').click();

      return settled();
    });
  });

  test('clicking copy displays message', async function(assert) {
    assert.expect(4);
    const iliosConfigMock = Service.extend({
      userSearchType: resolve('ldap')
    });
    this.owner.register('service:iliosConfig', iliosConfigMock);
    this.set('user', user);
    await render(hbs`{{user-profile-ics user=user}}`);
    const button = 'button.copy-btn';
    const successMessage = '.yes';

    await settled();
    assert.equal(this.$(successMessage).length, 0);
    assert.equal(this.$(button).length, 1);
    triggerSuccess(this, '.copy-btn');
    assert.equal(this.$(successMessage).length, 1);
    assert.equal(this.$(successMessage).text().trim(), 'Copied Successfully');

  });
});
