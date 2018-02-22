import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | session table status', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders published', async function(assert) {
    const i = 'i';
    const row = EmberObject.create({
      isPublished: true,
      publishedAsTbd: false,
    });
    this.set('row', row);
    await render(hbs`{{session-table-status row=row}}`);

    assert.equal(this.$().text().trim(), '');
    assert.ok(this.$(i).hasClass('fa-star'));
  });

  test('it renders scheduled', async function(assert) {
    const i = 'i';
    const row = EmberObject.create({
      isPublished: true,
      publishedAsTbd: true,
    });
    this.set('row', row);
    await render(hbs`{{session-table-status row=row}}`);

    assert.equal(this.$().text().trim(), '');
    assert.ok(this.$(i).hasClass('fa-clock-o'));
  });

  test('it renders draft', async function(assert) {
    const i = 'i';
    const row = EmberObject.create({
      isPublished: false,
      publishedAsTbd: false,
    });
    this.set('row', row);
    await render(hbs`{{session-table-status row=row}}`);

    assert.equal(this.$().text().trim(), '');
    assert.ok(this.$(i).hasClass('fa-star-half-full'));
  });
});