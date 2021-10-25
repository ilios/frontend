import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';
import { component } from 'ilios/tests/pages/components/program-year/new';

module('Integration | Component | program-year/new', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function () {
    this.currentYear = new Date().getFullYear();
  });

  test('it renders', async function (assert) {
    assert.expect(14);

    await render(hbs`<ProgramYear::New
      @programYears={{(array)}}
      @save={{(noop)}}
      @cancel={{(noop)}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);

    assert.equal(component.title, 'New Program Year');
    const { options } = component.years;
    assert.equal(options.length, 10);
    assert.equal(options[0].text, String(this.currentYear - 5));
    assert.equal(options[1].text, String(this.currentYear - 4));
    assert.equal(options[2].text, String(this.currentYear - 3));
    assert.equal(options[3].text, String(this.currentYear - 2));
    assert.equal(options[4].text, String(this.currentYear - 1));
    assert.equal(options[5].text, String(this.currentYear));
    assert.equal(options[6].text, String(this.currentYear + 1));
    assert.equal(options[7].text, String(this.currentYear + 2));
    assert.equal(options[8].text, String(this.currentYear + 3));
    assert.equal(options[9].text, String(this.currentYear + 4));
    assert.ok(component.done.isVisible);
    assert.ok(component.cancel.isVisible);
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel fired.');
    });

    await render(hbs`<ProgramYear::New
      @programYears={{(array)}}
      @save={{(noop)}}
      @cancel={{this.cancel}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    await component.cancel.click();
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('save', async (startYear) => {
      assert.equal(startYear, (this.currentYear - 5).toString());
    });
    await render(hbs`<ProgramYear::New
      @programYears={{(array)}}
      @save={{this.save}}
      @cancel={{(noop)}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    await component.done.click();
  });

  test('change value, then save', async function (assert) {
    assert.expect(3);
    const year = this.currentYear.toString();
    this.set('save', async (startYear) => {
      assert.equal(startYear, year);
    });
    await render(hbs`<ProgramYear::New
      @programYears={{(array)}}
      @save={{this.save}}
      @cancel={{(noop)}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    assert.notOk(component.years.options[5].isSelected);
    await component.years.select(year);
    assert.ok(component.years.options[5].isSelected);
    await component.done.click();
  });

  test('academic-years dropdown shows year ranges if application config enables it', async function (assert) {
    await render(hbs`<ProgramYear::New
      @programYears={{(array)}}
      @save={{(noop)}}
      @cancel={{(noop)}}
      @academicYearCrossesCalendarYearBoundaries={{true}}
    />`);
    const { options } = component.years;
    assert.equal(options.length, 10);
    assert.equal(options[0].text, `${this.currentYear - 5} - ${this.currentYear - 4}`);
    assert.equal(options[0].value, String(this.currentYear - 5));
    assert.equal(options[1].text, `${this.currentYear - 4} - ${this.currentYear - 3}`);
    assert.equal(options[1].value, String(this.currentYear - 4));
    assert.equal(options[2].text, `${this.currentYear - 3} - ${this.currentYear - 2}`);
    assert.equal(options[2].value, String(this.currentYear - 3));
    assert.equal(options[3].text, `${this.currentYear - 2} - ${this.currentYear - 1}`);
    assert.equal(options[3].value, String(this.currentYear - 2));
    assert.equal(options[4].text, `${this.currentYear - 1} - ${this.currentYear - 0}`);
    assert.equal(options[4].value, String(this.currentYear - 1));
    assert.equal(options[5].text, `${this.currentYear} - ${this.currentYear + 1}`);
    assert.equal(options[5].value, String(this.currentYear));
    assert.equal(options[6].text, `${this.currentYear + 1} - ${this.currentYear + 2}`);
    assert.equal(options[6].value, String(this.currentYear + 1));
    assert.equal(options[7].text, `${this.currentYear + 2} - ${this.currentYear + 3}`);
    assert.equal(options[7].value, String(this.currentYear + 2));
    assert.equal(options[8].text, `${this.currentYear + 3} - ${this.currentYear + 4}`);
    assert.equal(options[8].value, String(this.currentYear + 3));
    assert.equal(options[9].text, `${this.currentYear + 4} - ${this.currentYear + 5}`);
    assert.equal(options[9].value, String(this.currentYear + 4));
  });
});
