import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/school-vocabulary-manager';

module('Integration | Component | school vocabulary manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(6);
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
    assert.equal(component.title, `Title: ${vocabulary.title}`);
    assert.equal(component.breadcrumbs.all, 'All Vocabularies');
    assert.equal(component.breadcrumbs.vocabulary, vocabulary.title);
    assert.equal(component.terms.list.length, 2);
    assert.equal(component.terms.list[0].text, 'first (inactive)');
    assert.equal(component.terms.list[1].text, 'second');
  });
});
