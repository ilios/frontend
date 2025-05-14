import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-session-type-form';
import SchoolSessionTypeForm from 'frontend/components/school-session-type-form';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | school session type form', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.store = this.owner.lookup('service:store');
  });

  test('it renders', async function (assert) {
    this.server.create('aamc-method', {
      id: 'AM001',
      description: 'lorem ipsum',
      active: true,
    });
    this.server.create('aamc-method', {
      id: 'AM002',
      description: 'dolor sit',
      active: false,
    });
    this.server.create('aamc-method', {
      id: 'IM001',
      description: 'amet',
      active: true,
    });
    this.server.create('assessment-option', {
      name: 'formative',
    });
    const summative = this.server.create('assessment-option', {
      name: 'summative',
    });
    this.set('assessmentOptionId', summative.id);
    this.set('title', 'one');
    this.set('calendarColor', '#ffffff');
    await this.store.findAll('aamc-method');
    await this.store.findAll('assessment-option');
    await render(
      <template>
        <SchoolSessionTypeForm
          @canEditTitle={{true}}
          @canEditAamcMethod={{true}}
          @canEditCalendarColor={{true}}
          @canEditAssessment={{true}}
          @canEditAssessmentOption={{true}}
          @canEditActive={{true}}
          @title={{this.title}}
          @calendarColor={{this.calendarColor}}
          @assessment={{true}}
          @isActive={{true}}
          @selectedAssessmentOptionId={{this.assessmentOptionId}}
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.title.value, 'one');
    assert.strictEqual(component.aamcMethod.value, '');
    assert.strictEqual(component.aamcMethod.options.length, 2);
    assert.strictEqual(component.aamcMethod.options[0].value, '');
    assert.ok(component.aamcMethod.options[0].selected);
    assert.strictEqual(component.aamcMethod.options[1].value, 'AM001');
    assert.strictEqual(component.aamcMethod.options[1].text, 'lorem ipsum');
    assert.notOk(component.aamcMethod.options[1].selected);
    assert.strictEqual(component.calendarColor.value, '#ffffff');
    assert.strictEqual(component.assessment.yesNoToggle.checked, 'true');
    assert.strictEqual(component.active.yesNoToggle.checked, 'true');
    assert.strictEqual(component.assessmentSelector.value, '2');
    assert.strictEqual(component.assessmentSelector.options.length, 2);
    assert.strictEqual(component.assessmentSelector.options[0].value, '1');
    assert.strictEqual(component.assessmentSelector.options[0].text, 'formative');
    assert.notOk(component.assessmentSelector.options[0].selected);
    assert.strictEqual(component.assessmentSelector.options[1].value, '2');
    assert.strictEqual(component.assessmentSelector.options[1].text, 'summative');
    assert.ok(component.assessmentSelector.options[1].selected);
  });

  test('changing assessment changes available aamcMethods', async function (assert) {
    this.server.create('aamc-method', {
      id: 'AM001',
      description: 'lorem ipsum',
      active: true,
    });
    this.server.create('aamc-method', {
      id: 'IM001',
      description: 'dolor sit',
      active: true,
    });

    this.server.create('assessment-option', {
      name: 'formative',
    });
    this.server.create('assessment-option', {
      name: 'summative',
    });
    const assessmentOptions = await this.store.findAll('assessment-option');
    await this.store.findAll('aamc-method');

    this.set('assessmentOption', assessmentOptions[1]);
    this.set('assessmentOptions', assessmentOptions);
    await render(
      <template>
        <SchoolSessionTypeForm
          @canEditAamcMethod={{true}}
          @canEditCalendarColor={{true}}
          @canEditAssessment={{true}}
          @assessment={{true}}
          @assessmentOption={{this.assessmentOption}}
          @assessmentOptions={{this.assessmentOptions}}
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.aamcMethod.value, '');
    assert.strictEqual(component.aamcMethod.options.length, 2);
    assert.strictEqual(component.aamcMethod.options[0].value, '');
    assert.ok(component.aamcMethod.options[0].selected);
    assert.strictEqual(component.aamcMethod.options[1].value, 'AM001');
    assert.strictEqual(component.aamcMethod.options[1].text, 'lorem ipsum');
    assert.notOk(component.aamcMethod.options[1].selected);

    await component.assessment.yesNoToggle.click();

    assert.strictEqual(component.aamcMethod.value, '');
    assert.strictEqual(component.aamcMethod.options.length, 2);
    assert.strictEqual(component.aamcMethod.options[0].value, '');
    assert.ok(component.aamcMethod.options[0].selected);
    assert.strictEqual(component.aamcMethod.options[1].value, 'IM001');
    assert.strictEqual(component.aamcMethod.options[1].text, 'dolor sit');
    assert.notOk(component.aamcMethod.options[1].selected);
  });

  test('assessment option hidden when assessment is false', async function (assert) {
    await this.store.findAll('aamc-method');
    await this.store.findAll('assessment-option');
    await render(
      <template>
        <SchoolSessionTypeForm
          @assessment={{false}}
          @assessmentOption={{null}}
          @assessmentOptions={{(array)}}
          @canEditAssessment={{true}}
          @canEditAssessmentOption={{true}}
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.assessment.isAssessment);
    assert.notOk(component.assessmentSelector.isVisible);
  });

  test('cancel fires action', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(
      <template>
        <SchoolSessionTypeForm @canUpdate={{true}} @save={{(noop)}} @close={{this.cancel}} />
      </template>,
    );

    await component.cancel.click();
  });

  test('close fires action', async function (assert) {
    assert.expect(1);
    this.set('close', () => {
      assert.ok(true);
    });
    await render(
      <template>
        <SchoolSessionTypeForm @canUpdate={{false}} @save={{(noop)}} @close={{this.close}} />
      </template>,
    );

    await component.close.click();
  });

  test('save fires action', async function (assert) {
    assert.expect(8);
    const method = this.server.create('aamc-method', {
      id: 'AM001',
      description: 'lorem ipsum',
      active: true,
    });
    const formative = this.server.create('assessment-option', {
      name: 'formative',
    });
    const aamcMethodModel = await this.store.findRecord('aamc-method', method.id);
    const assessmentOptionModel = await this.store.findRecord('assessment-option', formative.id);

    this.set('save', (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      assert.strictEqual(title, 'new title', 'title is correct');
      assert.strictEqual(calendarColor, '#a1b2c3', 'color is correct');
      assert.true(assessment, 'assessment is picked');
      assert.strictEqual(
        assessmentOption,
        assessmentOptionModel,
        'correct assessmentOption is sent',
      );
      assert.strictEqual(aamcMethod, aamcMethodModel, 'correct aamcMethod is sent');
      assert.false(isActive, 'correct isActive value is sent');
    });
    await render(
      <template>
        <SchoolSessionTypeForm
          @title=""
          @calendarColor=""
          @assessment={{true}}
          @canEditTitle={{true}}
          @canEditAamcMethod={{true}}
          @canEditCalendarColor={{true}}
          @canEditAssessment={{true}}
          @canEditAssessmentOption={{true}}
          @canEditActive={{true}}
          @isActive={{true}}
          @canUpdate={{true}}
          @save={{this.save}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.active.yesNoToggle.checked, 'true');
    await component.title.set('new title');
    await component.aamcMethod.select(aamcMethodModel.id);
    await component.calendarColor.set('#a1b2c3');
    await component.assessmentSelector.select(assessmentOptionModel.id);
    await component.active.yesNoToggle.click();
    assert.strictEqual(component.active.yesNoToggle.checked, 'false');
    await component.submit.click();
  });

  test('read-only mode works correctly', async function (assert) {
    this.server.create('aamc-method', {
      id: 'AM001',
      description: 'lorem ipsum',
      active: true,
    });

    this.server.create('assessment-option', {
      name: 'formative',
    });

    await this.store.findAll('aamc-method');
    await this.store.findAll('assessment-option');
    await render(
      <template>
        <SchoolSessionTypeForm
          @canEditTitle={{false}}
          @canEditAamcMethod={{false}}
          @canEditCalendarColor={{false}}
          @canEditAssessment={{false}}
          @canEditAssessmentOption={{false}}
          @canEditActive={{false}}
          @title="one"
          @selectedAamcMethodId="AM001"
          @calendarColor="#ffffff"
          @assessment={{true}}
          @selectedAssessmentOptionId="1"
          @isActive={{true}}
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.title.inputControlIsVisible);
    assert.notOk(component.aamcMethod.inputControlIsVisible);
    assert.notOk(component.calendarColor.inputControlIsVisible);
    assert.notOk(component.assessment.yesNoToggle.isVisible);
    assert.notOk(component.assessmentSelector.inputControlIsVisible);
    assert.notOk(component.active.yesNoToggle.isVisible);

    assert.strictEqual(component.title.readonlyValue, 'one');
    assert.strictEqual(component.aamcMethod.readonlyValue, 'lorem ipsum');
    assert.strictEqual(component.calendarColor.readonlyValue, '#ffffff');
    assert.strictEqual(component.calendarColor.colorboxStyle, 'background-color: #ffffff');
    assert.strictEqual(component.assessment.readonlyValue, 'Yes');
    assert.strictEqual(component.assessmentSelector.readonlyValue, 'formative');
    assert.strictEqual(component.active.readonlyValue, 'Yes');
  });

  test('inactive method is labeled as such in dropdown', async function (assert) {
    this.server.create('aamc-method', {
      id: 'AM001',
      description: 'lorem ipsum',
      active: false,
    });

    this.server.create('assessment-option', {
      name: 'formative',
    });

    await this.store.findAll('aamc-method');
    await this.store.findAll('assessment-option');
    await render(
      <template>
        <SchoolSessionTypeForm
          @canEditAamcMethod={{true}}
          @selectedAamcMethodId="AM001"
          @assessment={{true}}
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.aamcMethod.value, 'AM001');
    assert.strictEqual(component.aamcMethod.options[1].text, 'lorem ipsum (inactive)');
  });

  test('inactive method is labeled as such in read-only mode', async function (assert) {
    const aamcMethodId = 'AM001';

    this.server.create('aamc-method', {
      id: aamcMethodId,
      description: 'lorem ipsum',
      active: false,
    });

    this.server.create('assessment-option', {
      name: 'formative',
    });

    await this.store.findAll('aamc-method');
    await this.store.findAll('assessment-option');
    this.set('aamcMethodId', aamcMethodId);
    await render(
      <template>
        <SchoolSessionTypeForm
          @canEditAamcMethod={{false}}
          @canEditActive={{true}}
          @selectedAamcMethodId={{this.aamcMethodId}}
          @assessment={{true}}
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.aamcMethod.readonlyValue, 'lorem ipsum (inactive)');
  });

  test('validation fails if title is blank', async function (assert) {
    await render(
      <template>
        <SchoolSessionTypeForm
          @assessment={{false}}
          @assessmentOption={{null}}
          @assessmentOptions={{(array)}}
          @canUpdate={{true}}
          @canEditTitle={{true}}
          @canEditCalendarColor={{false}}
          @calendarColor="#ffffff"
          @save={{(noop)}}
          @close={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.title.submit();
    assert.strictEqual(component.title.error, 'Title can not be blank');
    await component.title.set('a'.repeat(101));
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 100 characters)');
    await component.title.set('foo bar');
    assert.notOk(component.title.hasError);
  });
});
