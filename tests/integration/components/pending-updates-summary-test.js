import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

let storeMock;
let currentUserMock;

moduleForComponent('pending-updates-summary', 'Integration | Component | pending updates summary', {
  integration: true,
  beforeEach(){
    storeMock = Service.extend({});
    currentUserMock = Service.extend({});
    this.register('service:store', storeMock);
    this.register('service:currentUser', currentUserMock);
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
    school: resolve(primarySchool)
  });
  currentUserMock.reopen({
    model: resolve(user)
  });

  storeMock.reopen({
    query(what){
      assert.equal('pending-user-update', what);
      return resolve([1, 2, 3, 4, 5]);
    }
  });
  this.set('schools', [primarySchool, secondarySchool]);
  this.render(hbs`{{pending-updates-summary schools=schools}}`);

  await wait();

  assert.equal(this.$().text().trim().search(/Updates from the Campus Directory/), 0);
  assert.notEqual(this.$().text().trim().search(/There are 5 users needing attention/), -1);
  assert.ok(this.$(container).hasClass('alert'));
});
