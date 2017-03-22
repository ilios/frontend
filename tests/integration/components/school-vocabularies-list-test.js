import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';

const { Object:EmberObject, Service, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('school-vocabularies-list', 'Integration | Component | school vocabularies list', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(4);
  let term1 = Object.create({
    id: 1,
    title: 'term1'
  });
  let term2 = Object.create({
    id: 2,
    title: 'term2'
  });
  let term3 = Object.create({
    id: 3,
    title: 'term3'
  });
  let  vocabulary1 =  Object.create({
    id: 1,
    title: 'Vocabulary 1',
    terms: resolve([term1, term2]),
    isNew: false
  });
  term1.set('vocabulary', resolve(vocabulary1));
  term2.set('vocabulary', resolve(vocabulary1));
  let  vocabulary2 =  Object.create({
    id: 2,
    title: 'Vocabulary 2',
    terms: resolve([term3]),
    isNew: false
  });
  term3.set('vocabulary', resolve(vocabulary2));
  const school = EmberObject.create({
    vocabularies: resolve([vocabulary1, vocabulary2])
  });
  vocabulary1.set('school', resolve(school));
  vocabulary2.set('school', resolve(school));


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

  let term1 = EmberObject.create({
    id: 1,
    title: 'term1'
  });
  let term2 = EmberObject.create({
    id: 2,
    title: 'term2'
  });
  let term3 = EmberObject.create({
    id: 3,
    title: 'term3'
  });
  let  vocabulary1 =  EmberObject.create({
    id: 1,
    title: 'Vocabulary 1',
    terms: resolve([term1, term2]),
    isNew: false
  });
  term1.set('vocabulary', resolve(vocabulary1));
  term2.set('vocabulary', resolve(vocabulary1));

  let  vocabulary2 =  EmberObject.create({
    id: 2,
    title: 'Vocabulary 2',
    terms: resolve([term3]),
    isNew: false
  });

  term3.set('vocabulary', resolve(vocabulary2));

  let  vocabulary3 =  EmberObject.create({
    id: 3,
    title: 'Vocabulary 3',
    terms: resolve([]),
    isNew: false
  });

  const school = EmberObject.create({
    vocabularies: resolve([vocabulary1, vocabulary2, vocabulary3])
  });

  vocabulary1.set('school', resolve(school));
  vocabulary2.set('school', resolve(school));
  vocabulary3.set('school', resolve(school));


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

  let vocabularies = [vocabulary];

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
  let vocabulary1 =  Object.create({
    id: 1,
    title: 'Vocabulary 1',
    isNew: false
  });
  let vocabulary2 =  Object.create({
    id: 2,
    title: 'Vocabulary 2',
    isNew: false
  });

  let vocabularies = [vocabulary1, vocabulary2];

  const school = EmberObject.create({
    vocabularies: RSVP.resolve(vocabularies)
  });

  vocabulary1.set('school', resolve(school));
  vocabulary2.set('school', resolve(school));

  this.set('school', school);
  this.on('edit', function(id){
    assert.equal(id, vocabulary1.id);
  });
  this.render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
  return wait().then(() => {
    this.$('tr:eq(1) i').click();
  });

});
