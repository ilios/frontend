import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import startMirage from '../../helpers/start-mirage';
import wait from 'ember-test-helpers/wait';

const { Object, Service, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('pending-updates-summary', 'Integration | Component | pending updates summary', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});

test('it renders', async function(assert) {
  let primarySchool = Object.create(server.create('school'));
  let secondarySchool = Object.create(server.create('school'));
  let user = Object.create({
    school: resolve(primarySchool),
    schools: resolve([primarySchool, secondarySchool])
  });
  let currentUserMock = Service.extend({
    model: resolve(user)
  });

  let storeMock = Service.extend({
    query(what){
      assert.equal('pending-user-update', what);
      return resolve([1, 2, 3, 4, 5]);
    }
  });

  this.register('service:currentUser', currentUserMock);
  this.register('service:store', storeMock);
  const container = 'div';

  this.render(hbs`{{pending-updates-summary}}`);

  await wait();

  assert.equal(this.$().text().trim().search(/Updates from the Campus Directory/), 0);
  assert.notEqual(this.$().text().trim().search(/There are 5 users needing attention/), -1);
  assert.ok(this.$(container).hasClass('alert'));
});
