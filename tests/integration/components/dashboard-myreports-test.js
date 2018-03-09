import { getOwner } from '@ember/application';
import EmberObject, { computed } from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

let mockReports = [
  EmberObject.create({
    title: 'all courses',
    subject: 'courses',
    user: 1
  }),
  EmberObject.create({
    title: 'courses for session',
    subject: 'courses',
    prepositionalObject: 'session',
    prepositionalObjectTableRowId: 11,
    user: 1
  }),
];

let reportingMock = Service.extend({
  reportsList: computed(function(){
    return resolve(mockReports);
  })
});

let reportingMockNoReports = Service.extend({
  reportsList: computed(function(){
    return resolve([]);
  })
});

moduleForComponent('dashboard-myreports', 'Integration | Component | dashboard myreports', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  }
});

test('list reports', function(assert) {
  assert.expect(4);
  let currentUserMock = Service.extend({
    model: resolve(EmberObject.create({
      reports: resolve(mockReports)
    }))
  });
  this.register('service:reporting', reportingMock);
  this.register('service:currentUser', currentUserMock);
  this.render(hbs`{{dashboard-myreports}}`);

  assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Reports');
  return wait().then(()=> {
    for (let i = 0; i < 2; i++) {
      let tds = this.$(`[data-test-saved-reports] li:eq(${i})`);
      assert.equal(tds.eq(0).text().trim(), mockReports[i].get('title'));
    }
    assert.equal(this.$(`[data-test-saved-reports] li`).length, 2);
  });
});

test('display none when no reports', function(assert) {
  assert.expect(2);
  let currentUserMock = Service.extend({
    model: resolve(EmberObject.create({
      reports: resolve([])
    }))
  });
  this.register('service:reporting', reportingMockNoReports);
  this.register('service:currentUser', currentUserMock);
  this.render(hbs`{{dashboard-myreports}}`);
  assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Reports');
  assert.equal(this.$('.dashboard-block-body').text().trim(), 'None');
});
