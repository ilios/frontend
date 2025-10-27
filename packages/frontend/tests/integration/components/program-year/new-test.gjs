import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program-year/new';
import New from 'frontend/components/program-year/new';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | program-year/new', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.currentYear = new Date().getFullYear();
  });

  test('it renders', async function (assert) {
    await render(
      <template>
        <New
          @programYears={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'New Program Year');
    const { options } = component.years;
    assert.strictEqual(options.length, 10);
    assert.strictEqual(options[0].text, String(this.currentYear - 5));
    assert.strictEqual(options[1].text, String(this.currentYear - 4));
    assert.strictEqual(options[2].text, String(this.currentYear - 3));
    assert.strictEqual(options[3].text, String(this.currentYear - 2));
    assert.strictEqual(options[4].text, String(this.currentYear - 1));
    assert.strictEqual(options[5].text, String(this.currentYear));
    assert.strictEqual(options[6].text, String(this.currentYear + 1));
    assert.strictEqual(options[7].text, String(this.currentYear + 2));
    assert.strictEqual(options[8].text, String(this.currentYear + 3));
    assert.strictEqual(options[9].text, String(this.currentYear + 4));
    assert.ok(component.done.isVisible);
    assert.ok(component.cancel.isVisible);
  });

  test('cancel', async function (assert) {
    this.set('cancel', () => {
      assert.step('cancel called');
    });

    await render(
      <template>
        <New
          @programYears={{(array)}}
          @save={{(noop)}}
          @cancel={{this.cancel}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    await component.cancel.click();
    assert.verifySteps(['cancel called']);
  });

  test('save', async function (assert) {
    this.set('save', async (startYear) => {
      assert.step('save called');
      assert.strictEqual(startYear, (this.currentYear - 5).toString());
    });
    await render(
      <template>
        <New
          @programYears={{(array)}}
          @save={{this.save}}
          @cancel={{(noop)}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    await component.done.click();
    assert.verifySteps(['save called']);
  });

  test('change value, then save', async function (assert) {
    const year = this.currentYear.toString();
    this.set('save', async (startYear) => {
      assert.step('save called');
      assert.strictEqual(startYear, year);
    });
    await render(
      <template>
        <New
          @programYears={{(array)}}
          @save={{this.save}}
          @cancel={{(noop)}}
          @academicYearCrossesCalendarYearBoundaries={{false}}
        />
      </template>,
    );
    assert.notOk(component.years.options[5].isSelected);
    await component.years.select(year);
    assert.ok(component.years.options[5].isSelected);
    await component.done.click();
    assert.verifySteps(['save called']);
  });

  test('academic-years dropdown shows year ranges if application config enables it', async function (assert) {
    await render(
      <template>
        <New
          @programYears={{(array)}}
          @save={{(noop)}}
          @cancel={{(noop)}}
          @academicYearCrossesCalendarYearBoundaries={{true}}
        />
      </template>,
    );
    const { options } = component.years;
    assert.strictEqual(options.length, 10);
    assert.strictEqual(options[0].text, `${this.currentYear - 5} - ${this.currentYear - 4}`);
    assert.strictEqual(options[0].value, String(this.currentYear - 5));
    assert.strictEqual(options[1].text, `${this.currentYear - 4} - ${this.currentYear - 3}`);
    assert.strictEqual(options[1].value, String(this.currentYear - 4));
    assert.strictEqual(options[2].text, `${this.currentYear - 3} - ${this.currentYear - 2}`);
    assert.strictEqual(options[2].value, String(this.currentYear - 3));
    assert.strictEqual(options[3].text, `${this.currentYear - 2} - ${this.currentYear - 1}`);
    assert.strictEqual(options[3].value, String(this.currentYear - 2));
    assert.strictEqual(options[4].text, `${this.currentYear - 1} - ${this.currentYear - 0}`);
    assert.strictEqual(options[4].value, String(this.currentYear - 1));
    assert.strictEqual(options[5].text, `${this.currentYear} - ${this.currentYear + 1}`);
    assert.strictEqual(options[5].value, String(this.currentYear));
    assert.strictEqual(options[6].text, `${this.currentYear + 1} - ${this.currentYear + 2}`);
    assert.strictEqual(options[6].value, String(this.currentYear + 1));
    assert.strictEqual(options[7].text, `${this.currentYear + 2} - ${this.currentYear + 3}`);
    assert.strictEqual(options[7].value, String(this.currentYear + 2));
    assert.strictEqual(options[8].text, `${this.currentYear + 3} - ${this.currentYear + 4}`);
    assert.strictEqual(options[8].value, String(this.currentYear + 3));
    assert.strictEqual(options[9].text, `${this.currentYear + 4} - ${this.currentYear + 5}`);
    assert.strictEqual(options[9].value, String(this.currentYear + 4));
  });
});
