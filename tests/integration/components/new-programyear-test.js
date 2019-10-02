import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';

module('Integration | Component | new programyear', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function(assert) {
    assert.expect(8);
    this.set('nothing', parseInt);
    this.set('years', [{ label: '2018-2019', value: 2018}, {label: '2019-2020', value: 2019}]);
    await render(hbs`<NewProgramyear
      @save={{action nothing}}
      @cancel={{action nothing}}
      @availableAcademicYears={{years}}
    />`);
    const label = find('[data-test-newprogramyear-startyear] label');
    const options = findAll('[data-test-newprogramyear-startyear] option');
    const saveBtn = find('.buttons .done');
    const cancelBtn = find('.buttons .cancel');

    assert.dom(label).hasText('Academic Year:');
    assert.equal(options.length, 2);
    assert.dom(options[0]).hasText('2018-2019');
    assert.dom(options[0]).hasValue('2018');
    assert.dom(options[1]).hasText('2019-2020');
    assert.dom(options[1]).hasValue('2019');
    assert.ok(saveBtn);
    assert.ok(cancelBtn);
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel action fired.');
    });
    this.set('save', () => {});
    this.set('years', [{ label: '2018-2019', value: 2018}, {label: '2019-2020', value: 2019}]);
    await render(hbs`<NewProgramyear
      @save={{action save}}
      @cancel={{action cancel}}
      @availableAcademicYears={{years}}
    />`);
    const cancelBtn = find('.buttons .cancel');
    await click(cancelBtn);
  });

  test('save', async function(assert) {
    assert.expect(1);
    this.set('save', async (startYear) => {
      assert.equal(startYear, '2018');
    });
    this.set('cancel', () => {});
    this.set('years', [{ label: '2018-2019', value: 2018}, {label: '2019-2020', value: 2019}]);
    await render(hbs`<NewProgramyear
      @save={{action save}}
      @cancel={{action cancel}}
      @availableAcademicYears={{years}}
    />`);
    const saveBtn = find('.buttons .done');
    await click(saveBtn);
  });
});
