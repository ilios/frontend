import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('school-vocabulary-manager', 'Integration | Component | school vocabulary manager', {
  integration: true
});

test('it renders', function(assert) {
  let vocabulary = EmberObject.create({
    title: 'fake vocab',
    terms: resolve([])
  });

  this.set('vocabulary', vocabulary);
  this.on('nothing', parseInt);
  this.render(hbs`{{school-vocabulary-manager
    vocabulary=vocabulary
    manageTerm=(action 'nothing')
    manageVocabulary=(action 'nothing')
  }}`);

  const all = '.breadcrumbs span:eq(0)';
  const vocab = '.breadcrumbs span:eq(1)';

  assert.equal(this.$(all).text().trim(), 'All Vocabularies');
  assert.equal(this.$(vocab).text().trim(), vocabulary.title);
});
