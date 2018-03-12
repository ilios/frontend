import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import { startMirage } from 'ilios/initializers/ember-cli-mirage';
import wait from 'ember-test-helpers/wait';

moduleForComponent('collapsed-competencies', 'Integration | Component | collapsed competencies', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
    this.server = startMirage();
  },
  teardown() {
    this.server.shutdown();
  }
});

test('it renders', function(assert) {
  assert.expect(4);
  let schoolA = this.server.create('school', {title: 'Medicine'});
  let schoolB = this.server.create('school', {title: 'Pharmacy'});
  let competencyA = EmberObject.create(this.server.create('competency', { schoolId: 1 }));
  competencyA.school = RSVP.resolve(schoolA);
  let competencyB = EmberObject.create(this.server.create('competency', { schoolId: 2 }));
  competencyB.school = RSVP.resolve(schoolB);
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
  let schoolA = this.server.create('school', {title: 'Medicine'});
  let schoolB = this.server.create('school', {title: 'Pharmacy'});
  let competencyA = EmberObject.create(this.server.create('competency', { schoolId: 1 }));
  competencyA.school = RSVP.resolve(schoolA);
  let competencyB = EmberObject.create(this.server.create('competency', { schoolId: 2 }));
  competencyB.school = RSVP.resolve(schoolB);
  let competencies = [competencyA, competencyB];

  const course = EmberObject.create({
    competencies: RSVP.resolve(competencies)
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
