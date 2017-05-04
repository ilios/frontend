import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, Service, RSVP } = Ember;
const { resolve } = RSVP;

let storeMock;

moduleForComponent('pending-updates-summary', 'Integration | Component | pending updates summary', {
  integration: true,
  beforeEach(){
    storeMock = Service.extend({});
    this.register('service:store', storeMock);
  }
});

test('it renders', async function(assert) {
  const container = 'div';
  let primarySchool = EmberObject.create({
    id: 1,
    title: 'school 0'
  });
  let secondarySchool = EmberObject.create({
    id: 2,
    title: 'school 1'
  });
  let user = EmberObject.create({
    school: resolve(primarySchool),
    schools: resolve([primarySchool, secondarySchool])
  });
  let currentUserMock = Service.extend({
    model: resolve(user)
  });


  this.register('service:currentUser', currentUserMock);
  storeMock.reopen({
    query(what){
      assert.equal('pending-user-update', what);
      return resolve([1, 2, 3, 4, 5]);
    }
  });

  this.render(hbs`{{pending-updates-summary}}`);

  await wait();

  assert.equal(this.$().text().trim().search(/Updates from the Campus Directory/), 0);
  assert.notEqual(this.$().text().trim().search(/There are 5 users needing attention/), -1);
  assert.ok(this.$(container).hasClass('alert'));
});
