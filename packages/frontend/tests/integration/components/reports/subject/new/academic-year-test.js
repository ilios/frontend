import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/new/academic-year';

module('Integration | Component | reports/subject/new/academic-year', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    this.server.create('academic-year', {
      id: 2015,
      title: 2015,
    });
    this.server.create('academic-year', {
      id: 2031,
      title: 2031,
    });
    this.server.create('academic-year', {
      id: 2060,
      title: 2060,
    });
  });

  test('it renders', async function (assert) {
    assert.expect(10);
    this.set('currentId', null);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '2015');
      this.set('currentId', id);
    });
    await render(hbs`<Reports::Subject::New::AcademicYear
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);

    assert.strictEqual(component.options.length, 3);
    assert.strictEqual(component.options[0].text, '2015');
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.value, '2015');

    assert.strictEqual(component.options[1].text, '2031');
    assert.notOk(component.options[1].isSelected);

    this.set('currentId', '2031');
    assert.notOk(component.options[0].isSelected);
    assert.ok(component.options[1].isSelected);
    assert.strictEqual(component.value, '2031');
  });

  test('it works', async function (assert) {
    assert.expect(5);
    this.set('currentId', '2031');
    await render(hbs`<Reports::Subject::New::AcademicYear
      @currentId={{this.currentId}}
      @changeId={{this.changeId}}
      @school={{null}}
     />`);
    this.set('changeId', (id) => {
      assert.strictEqual(id, '2015');
      this.set('currentId', id);
    });
    assert.ok(component.options[1].isSelected);
    await component.set('2015');
    assert.notOk(component.options[1].isSelected);
    assert.ok(component.options[0].isSelected);
    assert.strictEqual(component.value, '2015');
  });
});
