import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  findAll,
  click
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school vocabulary term manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(9);
    let allParents = resolve([
      {id: 1, title: 'first'},
      {id: 2, title: 'second'},
    ]);

    let child1 = EmberObject.create({
      title: 'first child',
      active: true,
      isNew: false,
      isDeleted: false,
    });

    let child2 = EmberObject.create({
      title: 'second child',
      active: false,
      isNew: false,
      isDeleted: false,
    });

    let children = resolve([ child1, child2 ]);
    let vocabulary = EmberObject.create({
      title: 'fake vocab'
    });
    let title = 'fake term';
    let description = 'fake description';
    let term = EmberObject.create({
      allParents,
      children,
      vocabulary: resolve(vocabulary),
      title,
      description
    });

    this.set('term', term);
    this.set('vocabulary', vocabulary);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);

    const all = '.breadcrumbs span:nth-of-type(1)';
    const vocab = '.breadcrumbs span:nth-of-type(2)';
    const firstParent = '.breadcrumbs span:nth-of-type(4)';
    const secondParent = '.breadcrumbs span:nth-of-type(3)';
    const termCrumb = '.breadcrumbs span:nth-of-type(5)';

    const termTitle = '.term-title .editinplace';
    const termDescription = '.term-description .editinplace';

    assert.dom(all).hasText('All Vocabularies');
    assert.dom(vocab).hasText(vocabulary.title);
    assert.dom(firstParent).hasText('first');
    assert.dom(secondParent).hasText('second');
    assert.dom(termCrumb).hasText(title);
    assert.dom(termTitle).hasText(title);
    assert.dom(termDescription).hasText(description);
    assert.dom('.terms ul li').hasText('first child');
    assert.dom(findAll('.terms ul li')[1]).hasText('second child (inactive)');
  });

  test('activate inactive term', async function(assert) {
    assert.expect(3);
    let vocabulary = EmberObject.create({
      title: 'fake vocab'
    });
    let title = 'fake term';
    let description = 'fake tescription';
    let term = EmberObject.create({
      children: resolve([]),
      vocabulary: resolve(vocabulary),
      title,
      description,
      active: false,
      save() {
        return resolve(this);
      }
    });
    this.set('term', term);
    this.set('vocabulary', vocabulary);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);

    const toggle = `.is-active .toggle-yesno`;
    const toggleValue = `${toggle} input`;
    assert.dom(toggleValue).isNotChecked();
    await click(toggle);
    await settled();
    assert.ok(term.get('active'));
    assert.dom(toggleValue).isChecked();
  });

  test('inactive active term', async function(assert) {
    assert.expect(3);
    let vocabulary = EmberObject.create({
      title: 'fake vocab'
    });
    let title = 'fake term';
    let description = 'fake tescription';
    let term = EmberObject.create({
      children: resolve([]),
      vocabulary: resolve(vocabulary),
      title,
      description,
      active: true,
      save() {
        return resolve(this);
      }
    });
    this.set('term', term);
    this.set('vocabulary', vocabulary);
    this.set('nothing', () => {});
    await render(hbs`{{
      school-vocabulary-term-manager
      term=term
      vocabulary=vocabulary
      manageTerm=(action nothing)
      manageVocabulary=(action nothing)
      canUpdate=true
      canDelete=true
      canCreate=true
    }}`);

    const toggle = `.is-active .toggle-yesno`;
    const toggleValue = `${toggle} input`;
    assert.dom(toggleValue).isChecked();
    await click(toggle);
    await settled();
    assert.notOk(term.get('active'));
    assert.dom(toggleValue).isNotChecked();
  });
});
