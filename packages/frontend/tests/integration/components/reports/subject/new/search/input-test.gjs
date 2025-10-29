import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/reports/subject/new/search/input';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import SearchInput from 'frontend/components/reports/subject/new/search/input';
import { array } from '@ember/helper';

module('Integration | Component | reports/subject/new/search/input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(<template><SearchInput /></template>);

    await render(
      <template>
        <SearchInput
          @search={{this.search}}
          @results={{array 1 2 3}}
          @searchIsIdle={{true}}
          as |num|
        >
          {{num}}
        </SearchInput>
      </template>,
    );
    assert.ok(component.hasInput);
    assert.strictEqual(component.text, '3 Results 1 2 3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it works', async function (assert) {
    const input = 'typed it';
    this.set('search', (value) => {
      assert.step('search called');
      assert.strictEqual(value, input);
    });
    await render(<template><SearchInput @search={{this.search}} /></template>);
    await component.input(input);
    await component.triggerInput();
    assert.verifySteps(['search called']);
  });

  test('require at least three chars to run autocomplete #4769', async function (assert) {
    const input = 'ty';
    this.set('search', () => {
      assert.step('search called');
    });
    await render(
      <template><SearchInput @search={{this.search}} @searchIsIdle={{true}} /></template>,
    );
    await component.input(input);
    await component.triggerInput();
    assert.strictEqual(component.text, 'keep typing...');
    assert.verifySteps([]);
  });
});
