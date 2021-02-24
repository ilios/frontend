import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | new programyear', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  hooks.beforeEach(function() {
    this.currentYear = (new Date()).getFullYear();
  });

  test('it renders', async function(assert) {
    await render(hbs`<NewProgramyear
      @cancel={{noop}}
      @save={{noop}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    const label = find('[data-test-newprogramyear-startyear] label');
    const options = findAll('[data-test-newprogramyear-startyear] option');
    const saveBtn = find('.buttons .done');
    const cancelBtn = find('.buttons .cancel');
    assert.dom(label).hasText('Academic Year:');
    assert.equal(options.length, 10);
    assert.dom(options[0]).hasText((this.currentYear - 5).toString());
    assert.dom(options[0]).hasValue((this.currentYear - 5).toString());
    assert.dom(options[9]).hasText((this.currentYear + 4).toString());
    assert.dom(options[9]).hasValue((this.currentYear + 4).toString());
    assert.ok(saveBtn);
    assert.ok(cancelBtn);
  });

  test('academic-years dropdown shows year ranges if application config enables it', async function(assert) {
    await render(hbs`<NewProgramyear
      @cancel={{noop}}
      @save={{noop}}
      @academicYearCrossesCalendarYearBoundaries={{true}}
    />`);
    const options = findAll('[data-test-newprogramyear-startyear] option');
    assert.dom(options[0]).hasText(`${this.currentYear - 5} - ${this.currentYear - 4}`);
    assert.dom(options[0]).hasValue((this.currentYear - 5).toString());
    assert.dom(options[9]).hasText(`${this.currentYear + 4} - ${this.currentYear + 5}`);
    assert.dom(options[9]).hasValue((this.currentYear + 4).toString());
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel action fired.');
    });
    await render(hbs`<NewProgramyear
      @save={{noop}}
      @cancel={{this.cancel}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    const cancelBtn = find('.buttons .cancel');
    await click(cancelBtn);
  });

  test('save', async function(assert) {
    assert.expect(1);
    this.set('save', async (startYear) => {
      assert.equal(startYear, (this.currentYear - 5).toString());
    });
    await render(hbs`<NewProgramyear
      @save={{this.save}}
      @cancel={{noop}}
      @academicYearCrossesCalendarYearBoundaries={{false}}
    />`);
    const saveBtn = find('.buttons .done');
    await click(saveBtn);
  });
});
