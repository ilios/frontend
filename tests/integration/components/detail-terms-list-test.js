import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

moduleForComponent('detail-terms-list', 'Integration | Component | detail terms list', {
  integration: true
});

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
  this.render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms canEdit=false}}`);
  await wait();
  assert.equal(this.$('div > div').text().trim(), 'Topics (Medicine)');
  assert.equal(this.$('li').length, 2);
  assert.equal(this.$('li:eq(0)').text().trim(), 'bar');
  assert.equal(this.$('li:eq(1)').text().trim(), 'foo');
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
  this.render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms canEdit=false}}`);
  await wait();
  assert.equal(this.$('div > div').text().trim(), 'Topics (Medicine)');
  assert.equal(this.$('li').length, 0);
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
  this.on('remove', (val) => {
    assert.equal(val, term1);
  });

  this.set('vocabulary', vocabulary);
  this.set('terms', selectedTerms);
  this.render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms remove=(action 'remove') canEdit=true}}`);
  await wait();
  assert.equal(this.$('li:eq(0) .fa-remove').length, 1);
  this.$('li:eq(0)').click();
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
  this.render(hbs`{{detail-terms-list vocabulary=vocabulary terms=terms canEdit=true}}`);
  await wait();
  assert.equal(this.$('div > div .inactive').text().trim(), '(inactive)');
});
