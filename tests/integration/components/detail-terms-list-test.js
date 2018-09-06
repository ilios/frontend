import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | detail terms list', function(hooks) {
  setupRenderingTest(hooks);

  test('list with terms', async function(assert) {
    assert.expect(4);
    const school = EmberObject.create({
      title: 'Medicine'
    });

    const vocabulary = EmberObject.create({
      id: 1,
      title: 'Topics',
      school: school,
    });

    const vocabulary2 = EmberObject.create({
      id: 2,
      title: 'Something else',
      school: school,
    });

    const term1 = EmberObject.create({
      id: 1,
      title: 'foo',
      vocabulary,
      titleWithParentTitles: resolve('foo')

    });
    const term2 = EmberObject.create({
      id: 2,
      title: 'bar',
      vocabulary,
      titleWithParentTitles: resolve('bar')

    });
    const term3 = EmberObject.create({
      id: 3,
      title: 'baz',
      vocabulary: vocabulary2,
      titleWithParentTitles: resolve('baz')
    });
    const term4 = EmberObject.create({
      id: 4,
      title: 'bat',
      vocabulary: vocabulary2,
      titleWithParentTitles: resolve('bat')
    });

    const selectedTerms = [ term1, term2, term3, term4 ];
    this.set('vocabulary', vocabulary);
    this.set('terms', selectedTerms);
    await render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms canEdit=false}}`);
    assert.equal(find('[data-test-title]').textContent.trim(), 'Topics (Medicine)');
    assert.equal(findAll('li').length, 2);
    assert.equal(find('li').textContent.trim(), 'bar');
    assert.equal(findAll('li')[1].textContent.trim(), 'foo');
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    const school = EmberObject.create({
      title: 'Medicine'
    });

    const vocabulary = EmberObject.create({
      id: 1,
      title: 'Topics',
      school: school,
    });

    const vocabulary2 = EmberObject.create({
      id: 2,
      title: 'Something else',
      school: school,
    });

    const term1 = EmberObject.create({
      id: 1,
      title: 'foo',
      vocabulary: vocabulary2,
      titleWithParentTitles: resolve('foo')

    });
    const term2 = EmberObject.create({
      id: 2,
      title: 'bar',
      vocabulary: vocabulary2,
      titleWithParentTitles: resolve('bar')

    });
    const term3 = EmberObject.create({
      id: 3,
      title: 'baz',
      vocabulary: vocabulary2,
      titleWithParentTitles: resolve('baz')
    });
    const term4 = EmberObject.create({
      id: 4,
      title: 'bat',
      vocabulary: vocabulary2,
      titleWithParentTitles: resolve('bat')
    });

    const selectedTerms = [ term1, term2, term3, term4 ];
    this.set('vocabulary', vocabulary);
    this.set('terms', selectedTerms);
    await render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms canEdit=false}}`);
    await settled();
    assert.equal(find('[data-test-title]').textContent.trim(), 'Topics (Medicine)');
    assert.equal(findAll('li').length, 0);
  });

  test('remove term', async function(assert) {
    assert.expect(2);
    const school = EmberObject.create({
      title: 'Medicine'
    });

    const vocabulary = EmberObject.create({
      id: 1,
      title: 'Topics',
      school: school,
    });

    const term1 = EmberObject.create({
      id: 1,
      title: 'foo',
      vocabulary,
      isActiveInTree: resolve(true),
      titleWithParentTitles: resolve('foo')
    });

    const selectedTerms = [ term1 ];
    this.set('remove', val => {
      assert.equal(val, term1);
    });

    this.set('vocabulary', vocabulary);
    this.set('terms', selectedTerms);
    await render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms remove=(action remove) canEdit=true}}`);
    await settled();
    assert.equal(findAll('li:nth-of-type(1) .fa-times').length, 1);
    await click(find('li'));
  });

  test('inactive vocabulary labeled as such in edit mode', async function(assert) {
    assert.expect(1);
    const school = EmberObject.create({
      title: 'Medicine'
    });

    const vocabulary = EmberObject.create({
      id: 1,
      title: 'Topics',
      active: false,
      school: school,
    });

    this.set('vocabulary', vocabulary);
    this.set('terms', []);
    await render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms canEdit=true}}`);
    await settled();
    assert.equal(find('[data-test-title] .inactive').textContent.trim(), '(inactive)');
  });
});
