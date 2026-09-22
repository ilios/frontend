import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { array } from '@ember/helper';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'ilios-common/page-objects/components/taxonomy-manager-terms-list-item';
import ListItem from 'ilios-common/components/taxonomy-manager-terms-list-item';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | taxonomy manager terms list item', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const term = await this.server.create('term', { title: 'Term1', active: true });
    const term2 = await this.server.create('term', { title: 'Term2' });
    this.term = await this.owner.lookup('service:store').findRecord('term', term.id);
    this.term2 = await this.owner.lookup('service:store').findRecord('term', term2.id);
  });

  test('it renders an active term', async function (assert) {
    this.set('term', this.term);
    await render(
      <template>
        <ListItem @hasActiveParent={{true}} @selectedTerms={{(array)}} @term={{this.term}} />
      </template>,
    );

    assert.ok(component.isButton);
    assert.strictEqual(component.text, this.term.title);
    assert.strictEqual(component.title, this.term.title);
    assert.notOk(component.isLabeledAsInactive);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders an inactive term', async function (assert) {
    this.set('term', this.term2);
    await render(
      <template>
        <ListItem @hasActiveParent={{true}} @selectedTerms={{(array)}} @term={{this.term}} />
      </template>,
    );

    assert.notOk(component.isButton);
    assert.strictEqual(component.text, `${this.term2.title} (inactive)`);
    assert.strictEqual(component.title, this.term2.title);
    assert.ok(component.isLabeledAsInactive);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders as active term with an inactive parent', async function (assert) {
    this.set('term', this.term);
    await render(
      <template>
        <ListItem @hasActiveParent={{false}} @selectedTerms={{(array)}} @term={{this.term}} />
      </template>,
    );

    assert.notOk(component.isButton);
    assert.strictEqual(component.text, `${this.term.title}`);
    assert.strictEqual(component.title, this.term.title);
    assert.notOk(component.isLabeledAsInactive);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('selected term', async function (assert) {
    this.set('selectedTerms', [this.term]);
    this.set('term', this.term);
    this.set('remove', (term) => {
      assert.strictEqual(term, this.term);
      this.set(
        'selectedTerms',
        this.selectedTerms.filter((t) => t !== term),
      );
      assert.step('remove called');
    });

    await render(
      <template>
        <ListItem
          @hasActiveParent={{true}}
          @selectedTerms={{this.selectedTerms}}
          @term={{this.term}}
          @remove={{this.remove}}
        />
      </template>,
    );

    assert.ok(component.isSelected);
    assert.ok(component.hasRemoveIcon);
    assert.notOk(component.hasAddIcon);
    await component.click();
    assert.notOk(component.isSelected);
    assert.notOk(component.hasRemoveIcon);
    assert.ok(component.hasAddIcon);
    assert.verifySteps(['remove called']);
  });

  test('inactive term can be deselected, but not re-selected', async function (assert) {
    this.set('selectedTerms', [this.term2]);
    this.set('term', this.term2);
    this.set('remove', (term) => {
      assert.strictEqual(term, this.term2);
      this.set(
        'selectedTerms',
        this.selectedTerms.filter((t) => t !== term),
      );
      assert.step('remove called');
    });

    await render(
      <template>
        <ListItem
          @hasActiveParent={{true}}
          @selectedTerms={{this.selectedTerms}}
          @term={{this.term}}
          @remove={{this.remove}}
        />
      </template>,
    );

    assert.ok(component.isSelected);
    assert.ok(component.hasRemoveIcon);
    assert.notOk(component.hasAddIcon);
    await component.click();
    assert.notOk(component.isSelected);
    assert.notOk(component.hasRemoveIcon);
    assert.notOk(component.hasAddIcon);
    assert.verifySteps(['remove called']);
  });

  test('unselected term', async function (assert) {
    this.set('selectedTerms', []);
    this.set('term', this.term);
    this.set('add', (term) => {
      assert.strictEqual(term, this.term);
      this.set('selectedTerms', [...this.selectedTerms, term]);
      assert.step('add called');
    });

    await render(
      <template>
        <ListItem
          @hasActiveParent={{true}}
          @selectedTerms={{this.selectedTerms}}
          @term={{this.term}}
          @add={{this.add}}
        />
      </template>,
    );

    assert.notOk(component.isSelected);
    assert.ok(component.hasAddIcon);
    assert.notOk(component.hasRemoveIcon);
    await component.click();
    assert.ok(component.isSelected);
    assert.notOk(component.hasAddIcon);
    assert.ok(component.hasRemoveIcon);
    assert.verifySteps(['add called']);
  });
});
