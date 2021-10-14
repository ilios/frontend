import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/session/manage-objective-descriptors';

module('Integration | Component | session/manage-objective-descriptors', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const descriptors = this.server.createList('meshDescriptor', 4);
    const descriptorModel = await this.owner
      .lookup('service:store')
      .find('meshDescriptor', descriptors[0].id);
    this.set('selected', [descriptorModel]);
    await render(hbs`<Session::ManageObjectiveDescriptors
      @selected={{this.selected}}
      @add={{(noop)}}
      @remove={{(noop)}}
      @editable={{true}}
    />`);
    const m = component.meshManager;

    assert.equal(m.selectedTerms.length, 1);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    await m.search('descriptor');
    await m.runSearch();
    assert.equal(m.searchResults.length, 4);
    assert.equal(m.searchResults[0].title, `descriptor 0`);
    assert.ok(m.searchResults[0].isDisabled);
    assert.equal(m.searchResults[1].title, `descriptor 1`);
    assert.ok(m.searchResults[1].isEnabled);
    assert.equal(m.searchResults[2].title, `descriptor 2`);
    assert.ok(m.searchResults[2].isEnabled);
    assert.equal(m.searchResults[3].title, `descriptor 3`);
    assert.ok(m.searchResults[3].isEnabled);
  });

  test('add works', async function (assert) {
    assert.expect(16);
    const descriptors = this.server.createList('meshDescriptor', 2);
    const descriptorModel = await this.owner
      .lookup('service:store')
      .find('meshDescriptor', descriptors[0].id);
    this.set('selected', [descriptorModel]);
    this.set('add', (descriptor) => {
      this.set('selected', [descriptorModel, descriptor]);
      assert.ok(true);
    });
    await render(hbs`<Session::ManageObjectiveDescriptors
      @selected={{this.selected}}
      @add={{this.add}}
      @remove={{(noop)}}
      @editable={{true}}
    />`);
    const m = component.meshManager;

    assert.equal(m.selectedTerms.length, 1);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    await m.search('descriptor');
    await m.runSearch();
    assert.equal(m.searchResults.length, 2);
    assert.equal(m.searchResults[0].title, `descriptor 0`);
    assert.ok(m.searchResults[0].isDisabled);
    assert.equal(m.searchResults[1].title, `descriptor 1`);
    assert.ok(m.searchResults[1].isEnabled);
    await m.searchResults[1].add();

    assert.equal(m.selectedTerms.length, 2);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    assert.equal(m.selectedTerms[1].title, 'descriptor 1');
    assert.equal(m.searchResults.length, 2);
    assert.equal(m.searchResults[0].title, `descriptor 0`);
    assert.ok(m.searchResults[0].isDisabled);
    assert.equal(m.searchResults[1].title, `descriptor 1`);
    assert.ok(m.searchResults[1].isDisabled);
  });

  test('remove works', async function (assert) {
    assert.expect(15);
    const descriptors = this.server.createList('meshDescriptor', 2);
    const descriptorModel = await this.owner
      .lookup('service:store')
      .find('meshDescriptor', descriptors[0].id);
    this.set('selected', [descriptorModel]);
    this.set('remove', (descriptor) => {
      assert.equal(descriptor.id, descriptorModel.id);
      this.set('selected', []);
      assert.ok(true);
    });
    await render(hbs`<Session::ManageObjectiveDescriptors
      @selected={{this.selected}}
      @add={{(noop)}}
      @remove={{this.remove}}
      @editable={{true}}
    />`);
    const m = component.meshManager;

    assert.equal(m.selectedTerms.length, 1);
    assert.equal(m.selectedTerms[0].title, 'descriptor 0');
    await m.search('descriptor');
    await m.runSearch();
    assert.equal(m.searchResults.length, 2);
    assert.equal(m.searchResults[0].title, `descriptor 0`);
    assert.ok(m.searchResults[0].isDisabled);
    assert.equal(m.searchResults[1].title, `descriptor 1`);
    assert.ok(m.searchResults[1].isEnabled);
    await m.selectedTerms[0].remove();

    assert.equal(m.selectedTerms.length, 0);
    assert.equal(m.searchResults.length, 2);
    assert.equal(m.searchResults[0].title, `descriptor 0`);
    assert.ok(m.searchResults[0].isEnabled);
    assert.equal(m.searchResults[1].title, `descriptor 1`);
    assert.ok(m.searchResults[1].isEnabled);
  });
});
