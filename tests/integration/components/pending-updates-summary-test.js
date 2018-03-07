import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

let storeMock;
let currentUserMock;

module('Integration | Component | pending updates summary', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    storeMock = Service.extend({});
    currentUserMock = Service.extend({});
    this.owner.register('service:store', storeMock);
    this.owner.register('service:currentUser', currentUserMock);
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
    currentUserMock.reopen({
      model: resolve(user)
    });

    storeMock.reopen({
      query(what){
        assert.equal('pending-user-update', what);
        return resolve([1, 2, 3, 4, 5]);
      }
    });

    await render(hbs`{{pending-updates-summary}}`);

    await settled();

    assert.equal(this.$().text().trim().search(/Updates from the Campus Directory/), 0);
    assert.notEqual(this.$().text().trim().search(/There are 5 users needing attention/), -1);
    assert.ok(this.$(container).hasClass('alert'));
  });
});
