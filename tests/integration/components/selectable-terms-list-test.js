import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | selectable terms list', function(hooks) {
  setupRenderingTest(hooks);

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
    this.set('nothing', () => {});
    await render(
      hbs`{{selectable-terms-list selectedTerms=selectedTerms terms=topLevelTerms add='nothing' remove='nothing'}}`
    );

    const items = findAll('li');
    assert.equal(items.length, 5);
    assert.equal(items[0].textContent.replace(/[\t\n\s]+/g, ""), 'FirstAlphaBeta');
    assert.equal(items[1].textContent.replace(/[\t\n\s]+/g, ""), 'Alpha');
    assert.equal(items[2].textContent.replace(/[\t\n\s]+/g, ""), 'Beta');
    assert.equal(items[3].textContent.replace(/[\t\n\s]+/g, ""), 'SecondGamma');
    assert.equal(items[4].textContent.replace(/[\t\n\s]+/g, ""), 'Gamma');

    const topLevelItems = findAll('li.top-level');
    assert.equal(topLevelItems.length, 2);
    assert.equal(topLevelItems[0].textContent.replace(/[\t\n\s]+/g, ""), 'FirstAlphaBeta');
    assert.equal(topLevelItems[1].textContent.replace(/[\t\n\s]+/g, ""), 'SecondGamma');
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
    this.set('nothing', () => {});
    await render(
      hbs`{{selectable-terms-list selectedTerms=selectedTerms terms=topLevelTerms add='nothing' remove='nothing'}}`
    );

    const items = findAll('li');
    assert.equal(items.length, 2);
    assert.equal(items[0].textContent.replace(/[\t\n\s]+/g, ""), 'FirstAlpha');
    assert.equal(items[1].textContent.replace(/[\t\n\s]+/g, ""), 'Alpha');

    const topLevelItems = findAll('li.top-level');
    assert.equal(topLevelItems.length, 1);
    assert.equal(topLevelItems[0].textContent.replace(/[\t\n\s]+/g, ""), 'FirstAlpha');
  });
});
