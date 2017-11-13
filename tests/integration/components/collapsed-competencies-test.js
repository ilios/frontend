import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import wait from 'ember-test-helpers/wait';

moduleForComponent('collapsed-competencies', 'Integration | Component | collapsed competencies', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  },
  teardown() {
    window.server.shutdown();
  }
});

test('it renders', function(assert) {
  assert.expect(4);
  let schoolA = server.create('school', {title: 'Medicine'});
  let schoolB = server.create('school', {title: 'Pharmacy'});
  let competencyA = EmberObject.create(server.create('competency', { schoolId: 1 }));
  competencyA.school = RSVP.resolve(schoolA);
  let competencyB = EmberObject.create(server.create('competency', { schoolId: 2 }));
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
  let schoolA = server.create('school', {title: 'Medicine'});
  let schoolB = server.create('school', {title: 'Pharmacy'});
  let competencyA = EmberObject.create(server.create('competency', { schoolId: 1 }));
  competencyA.school = RSVP.resolve(schoolA);
  let competencyB = EmberObject.create(server.create('competency', { schoolId: 2 }));
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
