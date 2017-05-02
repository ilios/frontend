import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';

const { Object:EmberObject, Service, RSVP } = Ember;

moduleForComponent('school-vocabularies-list', 'Integration | Component | school vocabularies list', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(4);
  let  vocabulary1 = server.create('vocabulary', {school: 1, terms: [1, 2], isNew: false});
  let  vocabulary2 = server.create('vocabulary', {school: 1, terms: [3], isNew: false});
  server.createList('term', { vocabulary: [1]}, 2);
  server.createList('term', { vocabulary: [2]}, 1);

  let vocabularies = [vocabulary1, vocabulary2].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    vocabularies: RSVP.resolve(vocabularies)
  });

  this.on('edit', parseInt);
  this.set('school', school);
  this.render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
  return wait().then(() => {
    assert.equal(this.$('tr:eq(1) td:eq(0)').text().trim(), 'Vocabulary 1');
    assert.equal(this.$('tr:eq(2) td:eq(0)').text().trim(), 'Vocabulary 2');
    assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), '2');
    assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), '1');
  });

});

test('can create new vocabulary', function(assert) {
  assert.expect(5);
  let storeMock = Service.extend({
    createRecord(type, {title, school}){
      assert.equal(type, 'vocabulary');
      assert.equal(title, 'new vocab');
      assert.equal(school, school);
      return {
        title,
        school,
        save(){
          assert.ok(true);
          return RSVP.resolve(this);
        }
      };
    }
  });
  this.register('service:store', storeMock);


  const school = EmberObject.create({
    vocabularies: RSVP.resolve([])
  });

  this.on('edit', parseInt);
  this.set('school', school);
  this.render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
  this.$('.expand-button').click();
  this.$('input').val('new vocab').trigger('change');
  return wait().then(() => {
    this.$('.done').click();
    return wait().then(() => {
      assert.equal(this.$('.savedvocabulary').text().trim().search(/new vocab/), 0);
    });
  });

});

test('cannot delete vocabularies with terms', function(assert) {
  assert.expect(3);
  let  vocabulary1 = server.create('vocabulary', {school: 1, terms: [1, 2], isNew: false});
  let  vocabulary2 = server.create('vocabulary', {school: 1, terms: [3], isNew: false});
  let  vocabulary3 = server.create('vocabulary', {school: 1, isNew: false});
  server.createList('term', { vocabulary: [1]}, 2);
  server.createList('term', { vocabulary: [2]}, 1);

  let vocabularies = [vocabulary1, vocabulary2, vocabulary3].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    vocabularies: RSVP.resolve(vocabularies)
  });

  this.on('edit', parseInt);
  this.set('school', school);
  this.render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
  return wait().then(() => {
    assert.equal(this.$('tr:eq(1) td:eq(2) i').length, 1);
    assert.equal(this.$('tr:eq(2) td:eq(2) i').length, 1);
    assert.equal(this.$('tr:eq(3) td:eq(2) i').length, 2);
  });

});

test('clicking delete removes the vocabulary', function(assert) {
  assert.expect(6);
  let  vocabulary = {
    terms: [],
    title: 'nothing important',
    isNew: false,
    deleteRecord(){
      assert.ok(true);
    },
    save(){
      assert.ok(true);
    }
  };

  let vocabularies = [vocabulary].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    vocabularies: RSVP.resolve(vocabularies)
  });
  this.on('edit', parseInt);
  this.set('school', school);
  this.render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
  return wait().then(() => {
    assert.notOk(this.$('tr:eq(1)').hasClass('confirm-removal'));
    assert.equal(this.$('tr:eq(1) td:eq(2) .remove').length, 1);
    this.$('tr:eq(1) td:eq(2) .remove').click();

    return wait().then(() => {
      assert.equal(this.$('tr:eq(2)').text().trim().search(/Are you sure you want to delete this vocabulary/), 0);
      assert.ok(this.$('tr:eq(1)').hasClass('confirm-removal'));
      this.$('tr:eq(2) .remove').click();
    });
  });

});

test('clicking edit fires the action to manage the vocab', function(assert) {
  assert.expect(1);
  let  vocabulary1 = server.create('vocabulary', {school: 1, isNew: false});
  let  vocabulary2 = server.create('vocabulary', {school: 1, isNew: false});

  let vocabularies = [vocabulary1, vocabulary2].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    vocabularies: RSVP.resolve(vocabularies)
  });

  this.set('school', school);
  this.on('edit', function(id){
    assert.equal(id, vocabulary1.id);
  });
  this.render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
  return wait().then(() => {
    this.$('tr:eq(1) i').click();
  });

});
