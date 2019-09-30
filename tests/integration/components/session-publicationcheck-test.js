import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | session-publicationcheck', function(hooks) {
  setupRenderingTest(hooks);

  const parent = EmberObject.create();
  const objective1 = EmberObject.create({ parents: [parent] });

  test('it shows unlink icon', async function(assert) {
    const objective2 = EmberObject.create({ parents: [] });
    const session = EmberObject.create({
      ilmSession: resolve(),
      objectives: [objective1, objective2],
      postrequisite: resolve(),
      sessionDescription: resolve(),
      sessionType: resolve()
    });
    this.set('model', session);
    await render(hbs`<SessionPublicationcheck @session={{model}} />`);
    assert.ok(!!find('.fa-unlink'));
  });

  test('it does not shows unlink icon', async function(assert) {
    const objective2 = EmberObject.create({ parents: [parent] });
    const session = EmberObject.create({
      ilmSession: resolve(),
      objectives: [objective1, objective2],
      postrequisite: resolve(),
      sessionDescription: resolve(),
      sessionType: resolve()
    });
    this.set('model', session);
    await render(hbs`<SessionPublicationcheck @session={{model}} />`);
    assert.notOk(!!find('.fa-unlink'));
  });
});
