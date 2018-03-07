import EmberObject from '@ember/object';
import { getOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

module('Integration | Component | leadership list', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };
  });


  test('it renders with data', async function(assert) {
    assert.expect(5);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    let user2 = EmberObject.create({
      firstName: 'b',
      lastName: 'person',
      fullName: 'b a person',
    });
    this.set('directors', [user1]);
    this.set('administrators', [user2, user1]);

    await render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
    const directors = 'table tbody tr:eq(0) td:eq(0) li';
    const administrators = 'table tbody tr:eq(0) td:eq(1) li';

    assert.equal(this.$(directors).length, 1);
    assert.equal(this.$(directors).eq(0).text().trim(), 'a b person');
    assert.equal(this.$(administrators).length, 2);
    assert.equal(this.$(administrators).eq(0).text().trim(), 'a b person');
    assert.equal(this.$(administrators).eq(1).text().trim(), 'b a person');
  });

  test('it renders without data', async function(assert) {
    assert.expect(4);
    this.set('directors', []);
    this.set('administrators', []);

    await render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
    const directors = 'table tbody tr:eq(0) td:eq(0) li';
    const administrators = 'table tbody tr:eq(0) td:eq(1) li';

    assert.equal(this.$(directors).length, 1);
    assert.equal(this.$(directors).eq(0).text().trim(), 'None');
    assert.equal(this.$(administrators).length, 1);
    assert.equal(this.$(administrators).eq(0).text().trim(), 'None');
  });
});
