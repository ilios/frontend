import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | taxonomy manager', function(hooks) {
  setupRenderingTest(hooks);

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
    this.set('nothing', () => {});

    await render(hbs`{{taxonomy-manager subject=subject selectedTerms=selectedTerms add='nothing' remove='nothing'}}`);

    await settled();
    assert.dom('.detail-terms-list').exists({ count: 2 });
    assert.ok(find('.detail-terms-list').textContent.indexOf('Foo (Medicine)') !== -1);
    assert.dom('.detail-terms-list:nth-of-type(1) .detail-terms-list-item').hasText('Alpha');
    assert.dom(findAll('.detail-terms-list:nth-of-type(1) .detail-terms-list-item')[1]).hasText('Beta');
    assert.ok(find(findAll('.detail-terms-list')[1]).textContent.indexOf('Bar (Medicine)') !== -1);
    assert.dom('.detail-terms-list:nth-of-type(2) .detail-terms-list-item').hasText('Gamma');

    assert.dom('.vocabulary-picker option').exists({ count: 1 });
    assert.dom('.vocabulary-picker option').hasValue('1');
    assert.dom('.vocabulary-picker option').hasText('Foo (Medicine)');
  });
});
