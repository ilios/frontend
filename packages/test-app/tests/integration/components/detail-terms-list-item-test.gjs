import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/detail-terms-list-item';
import DetailTermsListItem from 'ilios-common/components/detail-terms-list-item';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | detail terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    this.vocabulary = await this.server.create('vocabulary');
  });

  test('top-level', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      active: true,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    await render(
      <template><DetailTermsListItem @term={{this.term}} @canEdit={{false}} /></template>,
    );
    assert.strictEqual(component.name, 'Foo');
  });

  test('nested', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Lorem',
      active: true,
    });
    const term2 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Ipsum',
      parent: term,
      active: true,
    });
    const term3 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      parent: term2,
      active: true,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term3.id);
    this.set('term', termModel);
    await render(
      <template><DetailTermsListItem @term={{this.term}} @canEdit={{false}} /></template>,
    );
    assert.strictEqual(component.name, 'Lorem » Ipsum » Foo');
  });

  test('remove', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      active: true,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    this.set('remove', (val) => {
      assert.strictEqual(termModel, val);
      assert.step('remove called');
    });
    await render(
      <template>
        <DetailTermsListItem @term={{this.term}} @canEdit={{true}} @remove={{this.remove}} />
      </template>,
    );
    assert.strictEqual(component.name, 'Foo');
    assert.ok(component.hasDeleteIcon);
    await component.remove();
    assert.verifySteps(['remove called']);
  });

  test('inactive', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    await render(
      <template>
        <DetailTermsListItem @term={{this.term}} @canEdit={{true}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.name, 'Foo (inactive)');
    assert.ok(component.hasDeleteIcon);
  });

  test('read-only mode', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    await render(
      <template><DetailTermsListItem @term={{this.term}} @canEdit={{false}} /></template>,
    );
    assert.strictEqual(component.name, 'Foo (inactive)');
    assert.notOk(component.hasDeleteIcon);
  });

  test('inactive ancestor is labeled as such', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      active: true,
    });
    const term2 = await this.server.create('term', {
      parent: term,
      title: 'Bar',
    });
    const term3 = await this.server.create('term', {
      parent: term2,
      title: 'Brat',
    });
    const term4 = await this.server.create('term', {
      parent: term3,
      title: 'Wurst',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term4.id);
    this.set('term', termModel);
    await render(
      <template>
        <DetailTermsListItem @term={{this.term}} @canEdit={{true}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.name, 'Foo » Bar (inactive) » Brat » Wurst');
  });

  test('only apply inactive label to nested term if all its ancestors are active', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      active: true,
    });
    const term2 = await this.server.create('term', {
      parent: term,
      title: 'Bar',
      active: true,
    });
    const term3 = await this.server.create('term', {
      parent: term2,
      title: 'Brat',
      active: true,
    });
    const term4 = await this.server.create('term', {
      parent: term3,
      title: 'Wurst',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term4.id);
    this.set('term', termModel);
    await render(
      <template>
        <DetailTermsListItem @term={{this.term}} @canEdit={{true}} @remove={{(noop)}} />
      </template>,
    );
    assert.strictEqual(component.name, 'Foo » Bar » Brat » Wurst (inactive)');
  });
});
