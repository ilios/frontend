import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject-year-filter';
import SubjectYearFilter from 'frontend/components/reports/subject-year-filter';

module('Integration | Component | reports/subject-year-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.server.create('academic-year', {
      id: 2015,
    });
    this.server.create('academic-year', {
      id: 2016,
    });
  });

  test('it renders', async function (assert) {
    await render(
      <template><SubjectYearFilter @prepositionalObject={{null}} @subject="course" /></template>,
    );

    assert.ok(component.isVisible, true);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].text, 'All Academic Years');
    assert.strictEqual(component.items[1].text, '2016 - 2017');
    assert.strictEqual(component.items[2].text, '2015 - 2016');
  });
});
