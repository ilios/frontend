import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school vocabulary manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(4);
    let vocabulary = EmberObject.create({
      title: 'fake vocab',
      terms: resolve([
        { title: 'first', isTopLevel: true, isNew: false, isDeleted: false, active: false },
        { title: 'second', isTopLevel: true, isNew: false, isDeleted: false, active: true },
      ])
    });

    this.set('vocabulary', vocabulary);
    this.set('nothing', () => {});
    await render(hbs`{{school-vocabulary-manager
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
    }}`);

    const all = '.breadcrumbs span:nth-of-type(1)';
    const vocab = '.breadcrumbs span:nth-of-type(2)';

    assert.dom(all).hasText('All Vocabularies');
    assert.dom(vocab).hasText(vocabulary.title);
    assert.dom('.terms ul li').hasText('first (inactive)');
    assert.dom(findAll('.terms ul li')[1]).hasText('second');
  });
});
