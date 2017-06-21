import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('collapsed-competencies', 'Integration | Component | collapsed competencies', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(4);
  let schoolA = EmberObject.create({id: 1, title: 'Medicine'});
  let schoolB = EmberObject.create({id: 2, title: 'Pharmacy'});
  let competencyA = EmberObject.create({ school: resolve(schoolA) });
  let competencyB = EmberObject.create({ school: resolve(schoolB) });
  let competencies = [competencyA, competencyB];

  const course = EmberObject.create({
    competencies: RSVP.resolve(competencies)
  });

  this.set('course', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-competencies subject=course expand=(action 'click')}}`);
  return wait().then(() => {
    let content = this.$().text().trim();
    assert.equal(content.search(/Competencies \(2\)/), 0);
    assert.notEqual(content.search(/School(\s+)Competencies/), -1);
    assert.notEqual(content.search(/Medicine(\s+)1/), -1);
    assert.notEqual(content.search(/Pharmacy(\s+)1/), -1);
  });
});

test('clicking the header expands the list', function(assert) {
  assert.expect(2);
  let schoolA = EmberObject.create({id: 1, title: 'Medicine'});
  let schoolB = EmberObject.create({id: 2, title: 'Pharmacy'});
  let competencyA = EmberObject.create({ school: resolve(schoolA) });
  let competencyB = EmberObject.create({ school: resolve(schoolB) });
  let competencies = [competencyA, competencyB];

  const course = EmberObject.create({
    competencies: resolve(competencies)
  });

  this.set('course', course);
  this.on('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.render(hbs`{{collapsed-competencies subject=course expand=(action 'click')}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Competencies \(2\)/), 0);
    this.$('.title').click();
  });
});
