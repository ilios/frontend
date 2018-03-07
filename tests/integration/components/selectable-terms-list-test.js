import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | selectable terms list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
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
    this.actions.nothing = parseInt;
    await render(
      hbs`{{selectable-terms-list selectedTerms=selectedTerms terms=topLevelTerms add='nothing' remove='nothing'}}`
    );

    assert.equal(findAll('li').length, 5);
    assert.equal(find('li:eq(0) > div').textContent.trim(), 'First');
    assert.equal(find('li:eq(1) > div').textContent.trim(), 'Alpha');
    assert.equal(find('li:eq(2) > div').textContent.trim(), 'Beta');
    assert.equal(find('li:eq(3) > div').textContent.trim(), 'Second');
    assert.equal(find('li:eq(4) > div').textContent.trim(), 'Gamma');

    assert.equal(findAll('li.top-level').length, 2);
    assert.equal(find('li.top-level:eq(0) > div').textContent.trim(), 'First');
    assert.equal(find('li.top-level:eq(1) > div').textContent.trim(), 'Second');
  });

  test('inactive terms are not rendered', async function(assert) {
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
    this.actions.nothing = parseInt;
    await render(
      hbs`{{selectable-terms-list selectedTerms=selectedTerms terms=topLevelTerms add='nothing' remove='nothing'}}`
    );

    assert.equal(findAll('li').length, 2);
    assert.equal(find('li:eq(0) > div').textContent.trim(), 'First');
    assert.equal(find('li:eq(1) > div').textContent.trim(), 'Alpha');

    assert.equal(findAll('li.top-level').length, 1);
    assert.equal(find('li.top-level:eq(0) > div').textContent.trim(), 'First');
  });
});
