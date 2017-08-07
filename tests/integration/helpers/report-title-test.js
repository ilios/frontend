import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Service, RSVP, Object:EmberObject } = Ember;
const { resolve } = RSVP;

moduleForComponent('report-title', 'helper:report-title', {
  integration: true
});

test('custom title', function(assert) {
  assert.expect(1);
  const report = EmberObject.create({
    'title': 'Lorem Ipsum'
  });
  this.set('report', report);
  this.render(hbs`{{report-title report}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), report.get('title'));
  });
});

test('all competencies in all schools', function(assert) {
  assert.expect(1);
  const report = EmberObject.create({
    'prepositionalObject': null,
    'school': null,
    'subject': 'competency',
    'title': null,
  });
  const storeMock = Service.extend({});
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{report-title report}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), 'All Competencies in All Schools');
  });
});

test('all competencies in school X', function(assert) {
  assert.expect(1);
  const school = EmberObject.create({
    'title': 'School X'
  })
  const report = EmberObject.create({
    'prepositionalObject': null,
    'school': resolve(school),
    'subject': 'competency',
    'title': null,
  });
  const storeMock = Service.extend({});
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{report-title report}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), 'All Competencies in ' + school.get('title'));
  });
});
