import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
const { resolve } = RSVP;

module('Integration | Component | school vocabularies list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this);
    };

    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    assert.expect(4);
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
      termCount: 2,
      isNew: false
    });
    term1.set('vocabulary', resolve(vocabulary1));
    term2.set('vocabulary', resolve(vocabulary1));
    let  vocabulary2 =  EmberObject.create({
      id: 2,
      title: 'Vocabulary 2',
      terms: resolve([term3]),
      termCount: 1,
      isNew: false
    });
    term3.set('vocabulary', resolve(vocabulary2));
    const school = EmberObject.create({
      vocabularies: resolve([vocabulary1, vocabulary2])
    });
    vocabulary1.set('school', resolve(school));
    vocabulary2.set('school', resolve(school));


    this.actions.edit = parseInt;
    this.set('school', school);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);

    await settled();
    assert.equal(find('tr:eq(1) td').textContent.trim(), 'Vocabulary 1');
    assert.equal(find('tr:eq(2) td').textContent.trim(), 'Vocabulary 2');
    assert.equal(find(findAll('tr:eq(1) td')[1]).textContent.trim(), '2');
    assert.equal(find(findAll('tr:eq(2) td')[1]).textContent.trim(), '1');

  });

  test('can create new vocabulary', async function(assert) {
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
    this.owner.register('service:store', storeMock);


    const school = EmberObject.create({
      vocabularies: RSVP.resolve([])
    });

    this.actions.edit = parseInt;
    this.set('school', school);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
    await click('.expand-button');
    await fillIn('input', 'new vocab');
    return settled().then(async () => {
      await click('.done');
      return settled().then(() => {
        assert.equal(find('.savedvocabulary').textContent.trim().search(/new vocab/), 0);
      });
    });

  });

  test('cannot delete vocabularies with terms', async function(assert) {
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
      termCount: 2,
      isNew: false
    });
    term1.set('vocabulary', resolve(vocabulary1));
    term2.set('vocabulary', resolve(vocabulary1));

    let  vocabulary2 =  EmberObject.create({
      id: 2,
      title: 'Vocabulary 2',
      terms: resolve([term3]),
      termCount: 1,
      isNew: false
    });

    term3.set('vocabulary', resolve(vocabulary2));

    let  vocabulary3 =  EmberObject.create({
      id: 3,
      title: 'Vocabulary 3',
      terms: resolve([]),
      termCount: 0,
      isNew: false
    });

    const school = EmberObject.create({
      vocabularies: resolve([vocabulary1, vocabulary2, vocabulary3])
    });

    vocabulary1.set('school', resolve(school));
    vocabulary2.set('school', resolve(school));
    vocabulary3.set('school', resolve(school));


    this.actions.edit = parseInt;
    this.set('school', school);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);

    await settled();
    assert.equal(findAll('tr:eq(1) td:eq(2) i').length, 1);
    assert.equal(findAll('tr:eq(2) td:eq(2) i').length, 1);
    assert.equal(findAll('tr:eq(3) td:eq(2) i').length, 2);

  });

  test('clicking delete removes the vocabulary', async function(assert) {
    assert.expect(5);
    let  vocabulary = {
      terms: [],
      termCount: 0,
      title: 'nothing important',
      isNew: false,
      destroyRecord(){
        assert.ok(true);
      },
    };

    let vocabularies = [vocabulary];

    const school = EmberObject.create({
      vocabularies: RSVP.resolve(vocabularies)
    });
    this.actions.edit = parseInt;
    this.set('school', school);
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
    return settled().then(async () => {
      assert.notOk(find(findAll('tr')[1]).classList.contains('confirm-removal'));
      assert.equal(findAll('tr:eq(1) td:eq(2) .remove').length, 1);
      await click('tr:eq(1) td:eq(2) .remove');

      return settled().then(async () => {
        assert.equal(find(findAll('tr')[2]).textContent.trim().search(/Are you sure you want to delete this vocabulary/), 0);
        assert.ok(find(findAll('tr')[1]).classList.contains('confirm-removal'));
        await click('tr:eq(2) .remove');
      });
    });

  });

  test('clicking edit fires the action to manage the vocab', async function(assert) {
    assert.expect(1);
    let vocabulary1 =  EmberObject.create({
      id: 1,
      title: 'Vocabulary 1',
      isNew: false
    });
    let vocabulary2 =  EmberObject.create({
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
    this.actions.edit = function(id){
      assert.equal(id, vocabulary1.id);
    };
    await render(hbs`{{school-vocabularies-list school=school manageVocabulary=(action 'edit')}}`);
    return settled().then(async () => {
      await click('tr:eq(1) i');
    });

  });
});
