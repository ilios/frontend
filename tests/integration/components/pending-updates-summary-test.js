import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import DS from 'ember-data';
import startMirage from '../../helpers/start-mirage';
import wait from 'ember-test-helpers/wait';

const { Object, RSVP } = Ember;
const { PromiseArray } = DS;
const { resolve } = RSVP;

moduleForComponent('pending-updates-summary', 'Integration | Component | pending updates summary', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  let primarySchool = Ember.Object.create(server.create('school'));
  let secondarySchool = Ember.Object.create(server.create('school'));
  let user = Ember.Object.create({
    school: resolve(primarySchool),
    schools: resolve([primarySchool, secondarySchool])
  });
  let currentUserMock = Ember.Service.extend({
    model: resolve(user)
  });

  let storeMock = Ember.Service.extend({
    query(what, obj){
      assert.equal('pending-user-update', what);
      return resolve([1, 2, 3, 4, 5]);
    }
  });

  this.register('service:currentUser', currentUserMock);
  this.register('service:store', storeMock);

  this.render(hbs`{{pending-updates-summary}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/There are 5 users waiting to be updated/), 0);
  });
});
