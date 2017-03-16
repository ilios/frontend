import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { RSVP, Service } = Ember;
const { resolve } = RSVP;

import wait from 'ember-test-helpers/wait';

moduleForComponent('ilios-users', 'Integration | Component | ilios users', {
  integration: true
});

test('it renders', function(assert) {
  const title = '.users .title';
  this.render(hbs`{{ilios-users}}`);
  assert.equal(this.$(title).text().trim(), 'Users');
});

test('param passing', async function(assert) {
  assert.expect(6);

  let storeMock = Service.extend({
    query(what, {q, limit, offset}){

      assert.equal('user', what);
      assert.equal(25, limit);
      assert.equal(25, offset);
      assert.equal('nothing', q);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  const query = '.user-search input';
  const setQuery = (val) => {
    assert.equal(val, 'test');
  };
  this.set('setQuery', setQuery);
  this.render(hbs`{{ilios-users query='nothing' limit=25 offset=25 setQuery=(action setQuery)}}`);
  await wait();

  assert.equal(this.$(query).val().trim(), 'nothing');
  this.$(query).val('test').change();
});
