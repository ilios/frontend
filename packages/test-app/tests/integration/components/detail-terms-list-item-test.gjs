import { module, test, skip } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click, findAll } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import DetailTermsListItem from 'ilios-common/components/detail-terms-list-item';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | detail terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    this.vocabulary = await this.server.create('vocabulary');
  });

  test('skip tests for MSW', function (assert) {
    assert.ok(false, 'unskip tests and then remove this one. MSW');
  });

  skip('top-level', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    await render(
      <template><DetailTermsListItem @term={{this.term}} @canEdit={{false}} /></template>,
    );
    assert.notStrictEqual(this.element.textContent.trim().indexOf('Foo'), -1);
  });

  skip('nested', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Lorem',
    });
    const term2 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Ipsum',
      parent: term,
    });
    const term3 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
      parent: term2,
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term3.id);
    this.set('term', termModel);
    await render(
      <template><DetailTermsListItem @term={{this.term}} @canEdit={{false}} /></template>,
    );
    assert.dom('.muted').includesText('Lorem »');
    assert.dom(findAll('.muted')[1]).includesText('Ipsum »');
    assert.notStrictEqual(this.element.textContent.trim().indexOf('Foo'), -1);
  });

  skip('remove', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    this.set('remove', (val) => {
      assert.step('remove called');
      assert.strictEqual(termModel, val);
    });
    await render(
      <template>
        <DetailTermsListItem @term={{this.term}} @canEdit={{true}} @remove={{this.remove}} />
      </template>,
    );
    assert.dom('.fa-xmark').exists({ count: 1 });
    await click('.fa-xmark');
    assert.verifySteps(['remove called']);
  });

  skip('inactive', async function (assert) {
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
    assert.dom('.inactive').hasText('(inactive)');
    assert.dom('.fa-xmark').exists({ count: 1 });
  });

  skip('read-only mode', async function (assert) {
    const term = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'Foo',
    });
    const termModel = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.set('term', termModel);
    await render(
      <template><DetailTermsListItem @term={{this.term}} @canEdit={{false}} /></template>,
    );
    assert.dom('.inactive').exists();
    assert.dom('.fa-xmark').doesNotExist();
  });
});
