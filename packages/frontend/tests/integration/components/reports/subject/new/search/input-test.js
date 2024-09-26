import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'frontend/tests/pages/components/reports/subject/new/search/input';
import a11yAudit from 'ember-a11y-testing/test-support/audit';

module('Integration | Component | reports/subject/new/search/input', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders and is accessible', async function (assert) {
    await render(hbs`<Reports::Subject::New::Search::Input />`);

    await render(hbs`<Reports::Subject::New::Search::Input
  @search={{this.search}}
  @results={{array 1 2 3}}
  @searchIsIdle={{true}}
  as |num|
>
  {{num}}
</Reports::Subject::New::Search::Input>`);
    assert.ok(component.hasInput);
    assert.strictEqual(component.text, '3 Results 1 2 3');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it works', async function (assert) {
    assert.expect(1);
    const input = 'typed it';
    this.set('search', (value) => {
      assert.strictEqual(value, input);
    });
    await render(hbs`<Reports::Subject::New::Search::Input @search={{this.search}} />`);
    await component.input(input);
    await component.triggerInput();
  });

  test('require at least three chars to run autocomplete #4769', async function (assert) {
    assert.expect(1);
    const input = 'ty';
    this.set('search', () => {
      assert.ok(false, 'search should not be called');
    });
    await render(hbs`<Reports::Subject::New::Search::Input @search={{this.search}} @searchIsIdle={{true}} />`);
    await component.input(input);
    await component.triggerInput();
    assert.strictEqual(component.text, 'keep typing...');
  });
});
