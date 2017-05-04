import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject } = Ember;

moduleForComponent('school-vocabularies-collapsed', 'Integration | Component | school vocabularies collapsed', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(5);
  let  vocabulary1 = server.create('vocabulary', {school: 1, terms: [1, 2]});
  let  vocabulary2 = server.create('vocabulary', {school: 1, terms: [3]});
  server.createList('term', { vocabulary: [1]}, 2);
  server.createList('term', { vocabulary: [2]}, 1);

  let vocabularies = [vocabulary1, vocabulary2].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    vocabularies
  });


  this.set('school', school);
  this.on('click', parseInt);
  this.render(hbs`{{school-vocabularies-collapsed school=school expand=(action 'click')}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Vocabularies \(2\)/), 0);
    assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'Vocabulary 1');
    assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'There are 2 terms');
    assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), 'Vocabulary 2');
    assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'There is 1 term');
  });
});

test('clicking the header expands the list', function(assert) {
  assert.expect(2);
  let  vocabulary = server.create('vocabulary', {school: 1});

  let vocabularies = [vocabulary].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    vocabularies
  });
  const title = '.title';

  this.set('school', school);
  this.on('click', () => {
    assert.ok(true, 'Action was fired');
  });
  this.render(hbs`{{school-vocabularies-collapsed school=school expand=(action 'click')}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Vocabularies \(1\)/), 0);
    this.$(title).click();
  });
});
