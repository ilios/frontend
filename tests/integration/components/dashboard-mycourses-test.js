import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

const { computed } = Ember;

let mockCourses = [
  Ember.Object.create({title: 'first', level: 4, academicYear: '2012-2013', locked: false, archived: false}),
  Ember.Object.create({title: 'second', level: 1, academicYear: '2013-2014', locked: false, archived: false}),
  Ember.Object.create({title: 'third', level: 1, academicYear: '2012-2013', locked: false, archived: false}),
  Ember.Object.create({title: 'locked', level: 1, academicYear: '2012-2013', locked: true, archived: false}),
  Ember.Object.create({title: 'archived', level: 1, academicYear: '2012-2013', locked: false, archived: true}),
];

let currentUserMock = Ember.Service.extend({
  relatedCourses: computed(function() {
    return Ember.RSVP.resolve(mockCourses);
  }),
  canEditCourses: true
});

let currentUserMockNoCourses = Ember.Service.extend({
  relatedCourses: computed(function() {
    return Ember.RSVP.resolve([]);
  }),
  canEditCourses: true
});

let currentUserMockUnprivileged = Ember.Service.extend({
  relatedCourses: computed(function() {
    return Ember.RSVP.resolve(mockCourses);
  }),
  canEditCourses: false
});

moduleForComponent('dashboard-mycourses', 'Integration | Component | dashboard mycourses' + testgroup, {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('list courses for privileged users', function(assert) {
  assert.expect(11);
  this.register('service:currentUser', currentUserMock);
  this.render(hbs`{{dashboard-mycourses}}`);
  assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Courses');
  Ember.run.later(()=> {
    for(let i = 0; i < 3; i++){
      let a = this.$(`table a:eq(${i})`);
      assert.equal(a.length, 1);
      let tds = this.$(`table tr:eq(${i}) td`);
      assert.equal(tds.eq(1).text().trim(), mockCourses[i].academicYear);
      assert.equal(tds.eq(2).text().trim(), mockCourses[i].title);
    }

    assert.equal(this.$(`table tr`).length, 3);
  });

});


test('list courses for un-privileged users', function(assert) {
  assert.expect(11);
  this.register('service:currentUser', currentUserMockUnprivileged);
  this.render(hbs`{{dashboard-mycourses}}`);
  assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Courses');

  Ember.run.later(()=> {
    for(let i = 0; i < 3; i++){
      let a = this.$(`table a:eq(${i})`);
      assert.equal(a.length, 0);
      let tds = this.$(`table tr:eq(${i}) td`);
      assert.equal(tds.eq(0).text().trim(), mockCourses[i].academicYear);
      assert.equal(tds.eq(1).text().trim(), mockCourses[i].title);
    }

    assert.equal(this.$(`table tr`).length, 3);
  });

});

test('display none when no courses', function(assert) {
  assert.expect(2);
  this.register('service:currentUser', currentUserMockNoCourses);
  this.render(hbs`{{dashboard-mycourses}}`);
  assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Courses');

  assert.equal(this.$('.dashboard-block-body').text().trim(), 'None');

});
