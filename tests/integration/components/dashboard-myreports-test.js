import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { computed, Object:EmberObject, RSVP, Service } = Ember;
const { resolve } = RSVP;

let mockReports = [
  EmberObject.create({
    displayTitle: resolve('all courses'),
    subject: 'courses',
    user: 1
  }),
  EmberObject.create({
    displayTitle: resolve('courses for session'),
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
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
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
      let tds = this.$(`table tr:eq(${i}) td`);
      mockReports[i].get('displayTitle').then(displayTitle => {
        assert.equal(tds.eq(0).text().trim(), displayTitle);
      });
    }
    assert.equal(this.$(`table tr`).length, 2);
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
