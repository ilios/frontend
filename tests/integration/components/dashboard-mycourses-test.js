import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

let mockCourses = [
  Ember.Object.create({title: 'first', level: 4, academicYear: '2012-2013', locked: false, archived: false}),
  Ember.Object.create({title: 'second', level: 1, academicYear: '2013-2014', locked: false, archived: false}),
  Ember.Object.create({title: 'third', level: 1, academicYear: '2012-2013', locked: false, archived: false}),
  Ember.Object.create({title: 'locked', level: 1, academicYear: '2012-2013', locked: true, archived: false}),
  Ember.Object.create({title: 'archived', level: 1, academicYear: '2012-2013', locked: false, archived: true}),
];

let currentUserMock = Ember.Service.extend({
  model: Ember.computed(function(){
    let model = Ember.Object.extend({
      allRelatedCourses: Ember.computed(function() {
        return Ember.RSVP.resolve(mockCourses);
      })
    });
    return new Ember.RSVP.resolve(model.create());
  })
});

let currentUserMockNoCourses = Ember.Service.extend({
  model: Ember.computed(function(){
    let model = Ember.Object.extend({
      allRelatedCourses: Ember.computed(function() {
        return Ember.RSVP.resolve([]);
      })
    });
    return new Ember.RSVP.resolve(model.create());
  })
});



moduleForComponent('dashboard-mycourses', 'Integration | Component | dashboard mycourses' + testgroup, {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('list courses', function(assert) {
  assert.expect(8);
  this.container.register('service:mockcurrentuser', currentUserMock);
  this.container.injection('component', 'currentUser', 'service:mockcurrentuser');
  this.render(hbs`{{dashboard-mycourses}}`);
  
  assert.equal(this.$('.dashboard-block-header').text().trim(), 'My Courses');
  
  for(let i = 0; i < 3; i++){
    let tds = this.$(`table tr:eq(${i}) td`);
    assert.equal(tds.eq(1).text().trim(), mockCourses[i].academicYear);
    assert.equal(tds.eq(2).text().trim(), mockCourses[i].title);
  }

  assert.equal(this.$(`table tr`).length, 3);
});

test('dont display when no courses', function(assert) {
  assert.expect(1);
  this.container.register('service:mockcurrentuser', currentUserMockNoCourses);
  this.container.injection('component', 'currentUser', 'service:mockcurrentuser');
  this.render(hbs`{{dashboard-mycourses}}`);
  assert.equal(this.$().text().trim(), '');
  
});
