import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/sequence-block-min-max-editor';

module(
  'Integration | Component | curriculum-inventory/sequence-block-min-max-editor',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (assert) {
      const minimum = '5';
      const maximum = '10';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
      @minimum={{this.minimum}}
      @maximum={{this.maximum}}
      @save={{noop}}
      @cancel={{noop}}
    />`);
      assert.equal(component.minimum.label, 'Minimum:', 'Minimum is labeled correctly.');
      assert.equal(component.minimum.value, minimum, 'Minimum input has correct value.');
      assert.notOk(component.minimum.isDisabled);
      assert.equal(component.maximum.label, 'Maximum:', 'Maximum is labeled correctly.');
      assert.equal(component.maximum.value, maximum, 'Maximum input has correct value.');
    });

    test('save', async function (assert) {
      assert.expect(2);
      const minimum = '5';
      const maximum = '10';
      const newMinimum = '50';
      const newMaximum = '100';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      this.set('save', (min, max) => {
        assert.equal(min, newMinimum, 'New minimum got passed to save action.');
        assert.equal(max, newMaximum, 'New maximum got passed to save action.');
      });
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{this.save}}
        @cancel={{noop}}
      />`);

      await component.minimum.set(newMinimum);
      await component.maximum.set(newMaximum);
      await component.save();
    });

    test('cancel', async function (assert) {
      assert.expect(1);
      const minimum = '5';
      const maximum = '10';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      this.set('cancel', () => {
        assert.ok(true, 'Cancel action got invoked.');
      });
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{noop}}
        @cancel={{this.cancel}}
      />`);
      await component.cancel();
    });

    test('save fails when minimum is larger than maximum', async function (assert) {
      const minimum = '0';
      const maximum = '0';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{noop}}
        @cancel={{noop}}
      />`);

      assert.notOk(component.maximum.hasError);
      await component.minimum.set('100');
      await component.maximum.set('50');
      await component.save();
      assert.ok(component.maximum.hasError);
    });

    test('save fails when minimum is less than zero', async function (assert) {
      const minimum = '0';
      const maximum = '0';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{noop}}
        @cancel={{noop}}
      />`);
      assert.notOk(component.minimum.hasError);
      await component.minimum.set('-1');
      await component.save();
      assert.ok(component.minimum.hasError);
    });

    test('save fails when minimum is empty', async function (assert) {
      const minimum = '0';
      const maximum = '0';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{noop}}
        @cancel={{noop}}
      />`);
      assert.notOk(component.minimum.hasError);
      await component.minimum.set('');
      await component.save();
      assert.ok(component.minimum.hasError);
    });

    test('save fails when maximum is empty', async function (assert) {
      const minimum = '0';
      const maximum = '0';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{noop}}
        @cancel={{noop}}
      />`);
      assert.notOk(component.maximum.hasError);
      await component.maximum.set('');
      await component.save();
      assert.ok(component.maximum.hasError);
    });

    test('minimum field is set to 0 and disabled for electives', async function (assert) {
      const minimum = '0';
      const maximum = '20';
      this.set('minimum', minimum);
      this.set('maximum', maximum);
      this.set('isElective', true);
      await render(hbs`<CurriculumInventory::SequenceBlockMinMaxEditor
        @minimum={{this.minimum}}
        @maximum={{this.maximum}}
        @save={{this.save}}
        @cancel={{noop}}
        @isElective={{this.isElective}}
      />`);
      assert.equal(component.minimum.value, '0');
      assert.ok(component.minimum.isDisabled);
    });
  }
);
