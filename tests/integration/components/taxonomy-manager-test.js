import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

moduleForComponent('taxonomy-manager', 'Integration | Component | taxonomy manager', {
  integration: true
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
  this.on('nothing', parseInt);

  this.render(hbs`{{taxonomy-manager subject=subject selectedTerms=selectedTerms add='nothing' remove='nothing'}}`);

  await wait();
  assert.equal(this.$('.detail-terms-list').length, 2);
  assert.ok(this.$('.detail-terms-list:eq(0)').text().indexOf('Foo (Medicine)') !== -1);
  assert.equal(this.$('.detail-terms-list:eq(0) .detail-terms-list-item:eq(0)').text().trim(), 'Alpha');
  assert.equal(this.$('.detail-terms-list:eq(0) .detail-terms-list-item:eq(1)').text().trim(), 'Beta');
  assert.ok(this.$('.detail-terms-list:eq(1)').text().indexOf('Bar (Medicine)') !== -1);
  assert.equal(this.$('.detail-terms-list:eq(1) .detail-terms-list-item:eq(0)').text().trim(), 'Gamma');

  assert.equal(this.$('.vocabulary-picker option').length, 1);
  assert.equal(this.$('.vocabulary-picker option:eq(0)').val(), '1');
  assert.equal(this.$('.vocabulary-picker option:eq(0)').text().trim(), 'Foo (Medicine)');
});
