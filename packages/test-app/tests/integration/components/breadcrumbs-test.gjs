import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { eq } from 'ember-truth-helpers';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import { component } from 'ilios-common/page-objects/components/breadcrumbs';

module('Integration | Component | breadcrumbs', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  test('it renders with no block', async function (assert) {
    const paths = [
      { route: 'learner-groups', title: 'Learner Groups', query: {} },
      { route: 'learner-groups', title: 'Program 2026', query: {} },
    ];
    const rootTitle = 'Learner Group 1';
    await render(<template><Breadcrumbs @paths={{paths}} @rootTitle={{rootTitle}} /></template>);

    await a11yAudit(this.element);
    assert.ok(component);
    assert.strictEqual(component.crumbs.length, 3);
    assert.strictEqual(component.crumbs[0].text, 'Learner Groups');
    assert.strictEqual(component.crumbs[1].text, 'Program 2026');
    assert.strictEqual(component.crumbs[2].text, 'Learner Group 1');
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with block', async function (assert) {
    const paths = [
      { route: 'learner-groups', title: 'Learner Groups', query: {} },
      { route: 'learner-groups', title: 'Program 2026', query: {} },
    ];
    const rootTitle = 'Learner Group 1';

    await render(
      <template>
        <Breadcrumbs @paths={{paths}} @rootTitle={{rootTitle}} as |path index|>
          {{#if (eq index 0)}}
            <a href="/learnergroups" class="crumb" data-test-crumb>
              (
              {{path.title}}
              )
            </a>
          {{else}}
            <a href="/foo" class="crumb" data-test-crumb>
              {{path.title}}
            </a>
          {{/if}}
        </Breadcrumbs>
      </template>,
    );

    await a11yAudit(this.element);
    assert.ok(component);
    assert.strictEqual(component.crumbs.length, 3);
    assert.strictEqual(component.crumbs[0].text, '( Learner Groups )');
    assert.strictEqual(component.crumbs[0].link, '/learnergroups');
    assert.strictEqual(component.crumbs[1].text, 'Program 2026');
    assert.strictEqual(component.crumbs[1].link, '/foo');
    assert.strictEqual(component.crumbs[2].text, 'Learner Group 1');
    assert.notOk(component.crumbs[2].link);
    assert.ok(true, 'no a11y errors found!');
  });
});
