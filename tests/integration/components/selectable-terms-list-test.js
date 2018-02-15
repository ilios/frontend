import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

moduleForComponent('selectable-terms-list', 'Integration | Component | selectable terms list', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(9);

  const term1 = EmberObject.create({
    id: 3,
    title: 'Alpha',
    isActiveInTree: resolve(true),
    isTopLevel: false,

  });

  const term2 = EmberObject.create({
    id: 4,
    title: 'Beta',
    isActiveInTree: resolve(true),
    isTopLevel: false,

  });

  const term3 = EmberObject.create({
    id: 4,
    title: 'Gamma',
    isActiveInTree: resolve(true),
    isTopLevel: false,

  });

  const term4 = EmberObject.create({
    id: 1,
    title: 'First',
    hasChildren: true,
    children: resolve([ term1, term2 ]),
    isActiveInTree: resolve(true),
    isTopLevel: true,
  });

  const term5 = EmberObject.create({
    id: 2,
    title: 'Second',
    hasChildren: true,
    children: resolve([ term3 ]),
    isActiveInTree: resolve(true),
    isTopLevel: true,
  });

  const topLevelTerms = [ term4, term5 ];
  this.set('selectedTerms', []);
  this.set('topLevelTerms', topLevelTerms);
  this.on('nothing', parseInt);
  this.render(hbs`{{selectable-terms-list selectedTerms=selectedTerms terms=topLevelTerms add='nothing' remove='nothing'}}`);

  assert.equal(this.$('li').length, 5);
  assert.equal(this.$('li:eq(0) > div').text().trim(), 'First');
  assert.equal(this.$('li:eq(1) > div').text().trim(), 'Alpha');
  assert.equal(this.$('li:eq(2) > div').text().trim(), 'Beta');
  assert.equal(this.$('li:eq(3) > div').text().trim(), 'Second');
  assert.equal(this.$('li:eq(4) > div').text().trim(), 'Gamma');

  assert.equal(this.$('li.top-level').length, 2);
  assert.equal(this.$('li.top-level:eq(0) > div').text().trim(), 'First');
  assert.equal(this.$('li.top-level:eq(1) > div').text().trim(), 'Second');
});

test('inactive terms are not rendered', function(assert) {
  assert.expect(5);

  const term1 = EmberObject.create({
    id: 3,
    title: 'Alpha',
    isActiveInTree: resolve(true),
    isTopLevel: false,

  });

  const term2 = EmberObject.create({
    id: 4,
    title: 'Beta',
    isActiveInTree: resolve(false),
    isTopLevel: false,

  });

  const term3 = EmberObject.create({
    id: 4,
    title: 'Gamma',
    isActiveInTree: resolve(false),
    isTopLevel: false,

  });

  const term4 = EmberObject.create({
    id: 1,
    title: 'First',
    hasChildren: true,
    children: resolve([ term1, term2 ]),
    isActiveInTree: resolve(true),
    isTopLevel: true,
  });

  const term5 = EmberObject.create({
    id: 2,
    title: 'Second',
    hasChildren: true,
    children: resolve([ term3 ]),
    isActiveInTree: resolve(false),
    isTopLevel: true,
  });

  const topLevelTerms = [ term4, term5 ];
  this.set('selectedTerms', []);
  this.set('topLevelTerms', topLevelTerms);
  this.on('nothing', parseInt);
  this.render(hbs`{{selectable-terms-list selectedTerms=selectedTerms terms=topLevelTerms add='nothing' remove='nothing'}}`);

  assert.equal(this.$('li').length, 2);
  assert.equal(this.$('li:eq(0) > div').text().trim(), 'First');
  assert.equal(this.$('li:eq(1) > div').text().trim(), 'Alpha');

  assert.equal(this.$('li.top-level').length, 1);
  assert.equal(this.$('li.top-level:eq(0) > div').text().trim(), 'First');
});
