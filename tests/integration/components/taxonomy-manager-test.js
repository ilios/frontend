import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | taxonomy manager', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    assert.expect(9);

    const school = EmberObject.create({
      id: 1,
      title: 'Medicine'
    });

    const vocab1 = EmberObject.create({
      id: 1,
      active: true,
      title: 'Foo',
      school,
      termCount: 2
    });

    const vocab2 = EmberObject.create({
      id: 2,
      active: false,
      title: 'Bar',
      school,
      termCount: 1
    });

    const vocab3 = EmberObject.create({
      id: 3,
      active: true,
      title: 'Baz',
      school,
      termCount: 0
    });

    const term1 = EmberObject.create({
      id: 1,
      isActiveInTree: true,
      title: 'Alpha',
      titleWithParentTitles: resolve('Alpha'),
      isTopLevel: true,
      belongsTo() {
        return {
          id() {
            return vocab1.get('id');
          }
        };
      },
      vocabulary: vocab1
    });

    const term2 = EmberObject.create({
      id: 2,
      isActiveInTree: true,
      title: 'Beta',
      titleWithParentTitles: resolve('Beta'),
      isTopLevel: true,
      belongsTo(){
        return {
          id() {
            return vocab1.get('id');
          }
        };
      },
      vocabulary: vocab1
    });

    const term3 = EmberObject.create({
      id: 3,
      isActiveInTree: true,
      title: 'Gamma',
      titleWithParentTitles: resolve('Gamma'),
      isTopLevel: true,
      belongsTo(){
        return {
          id() {
            return vocab2.get('id');
          }
        };
      },
      vocabulary: vocab2
    });

    vocab1.set('terms', [ term1, term2 ]);
    vocab2.set('terms', [ term3 ]);
    vocab3.set('terms', []);

    const subject = EmberObject.create({
      assignableVocabularies: [ vocab1, vocab2, vocab3 ]
    });

    const selectedTerms = [ term1, term2, term3 ];

    this.set('subject', subject);
    this.set('selectedTerms', selectedTerms);
    this.actions.nothing = parseInt;

    await render(hbs`{{taxonomy-manager subject=subject selectedTerms=selectedTerms add='nothing' remove='nothing'}}`);

    await settled();
    assert.equal(findAll('.detail-terms-list').length, 2);
    assert.ok(find('.detail-terms-list').textContent.indexOf('Foo (Medicine)') !== -1);
    assert.equal(find('.detail-terms-list:eq(0) .detail-terms-list-item').textContent.trim(), 'Alpha');
    assert.equal(find(findAll('.detail-terms-list:eq(0) .detail-terms-list-item')[1]).textContent.trim(), 'Beta');
    assert.ok(find(findAll('.detail-terms-list')[1]).textContent.indexOf('Bar (Medicine)') !== -1);
    assert.equal(find('.detail-terms-list:eq(1) .detail-terms-list-item').textContent.trim(), 'Gamma');

    assert.equal(findAll('.vocabulary-picker option').length, 1);
    assert.equal(find('.vocabulary-picker option').value, '1');
    assert.equal(find('.vocabulary-picker option').textContent.trim(), 'Foo (Medicine)');
  });
});
