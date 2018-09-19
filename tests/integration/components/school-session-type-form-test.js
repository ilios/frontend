import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | school session type form', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(9);
    this.server.create('aamc-method', {
      id: 'AM001',
      description: "lorem ipsum"
    });
    this.server.create('aamc-method', {
      id: 'IM001',
      description: "lorem ipsum"
    });
    this.server.create('assessment-option', {
      name: 'formative'
    });
    const summative = this.server.create('assessment-option', {
      name: 'summative'
    });
    this.set('assessmentOptionId', summative.id);
    this.set('nothing', () => {});
    await render(hbs`{{school-session-type-form
      canEditTitle=true
      canEditAamcMethod=true
      canEditCalendarColor=true
      canEditAssessment=true
      canEditAssessmentOption=true
      canEditActive=true
      title='one'
      calendarColor='#ffffff'
      assessment=true
      isActive=true
      selectedAssessmentOptionId=assessmentOptionId
      save=(action nothing)
      close=(action nothing)
    }}`);

    const title = '[data-test-title]';
    const titleInput = `${title} input`;
    const aamcMethod = '[data-test-aamc-method]';
    const aamcMethodSelect = `${aamcMethod} select`;
    const aamcMethodOptions = `${aamcMethodSelect} option`;
    const firstAamcMethodOption = `${aamcMethodOptions}:nth-of-type(1)`;
    const secondAamcMethodOption = `${aamcMethodOptions}:nth-of-type(2)`;
    const color = '[data-test-color]';
    const colorInput = `${color} input`;
    const assessment = '[data-test-assessment]';
    const assessmentInput = `${assessment} input`;
    const assessmentOption = '[data-test-assessment-option]';
    const assessmentOptionSelect = `${assessmentOption} select`;
    const isActive = '[data-test-active]';
    const isActiveInput = `${isActive} input`;

    assert.dom(titleInput).hasValue('one', 'title is correct');
    assert.dom(aamcMethodSelect).hasValue('', 'corrrect aamc method is selected');
    assert.dom(aamcMethodOptions).exists({ count: 2 }, 'right number of aamcMethod options');
    assert.dom(firstAamcMethodOption).hasValue('', 'first aamcMethod is blank');
    assert.dom(secondAamcMethodOption).hasValue('AM001', 'second aamcMethod is filtered correctly');
    assert.dom(colorInput).hasValue('#ffffff', 'color is correct');
    assert.dom(assessmentInput).isChecked('assessment is selected');
    assert.dom(isActiveInput).isChecked('active is selected');
    assert.dom(assessmentOptionSelect).hasValue('2', 'correct assessment option is selected');
  });

  test('changing assessment changes available aamcMethods', async function (assert) {
    this.server.create('aamc-method', {
      id: 'AM001',
      description: "lorem ipsum"
    });
    this.server.create('aamc-method', {
      id: 'IM001',
      description: "lorem ipsum"
    });

    this.server.create('assessment-option', {
      name: 'formative'
    });
    this.server.create('assessment-option', {
      name: 'summative'
    });
    const assessmentOptions = await run(() => this.owner.lookup('service:store').findAll('assessment-option'));

    this.set('assessmentOption', assessmentOptions[1]);
    this.set('assessmentOptions', assessmentOptions);
    this.set('nothing', () => {});
    await render(hbs`{{school-session-type-form
      canEditTitle=true
      canEditAamcMethod=true
      canEditCalendarColor=true
      canEditAssessment=true
      canEditAssessmentOption=true
      canEditActive=true
      title='one'
      calendarColor='#ffffff'
      assessment=true
      assessmentOption=assessmentOption
      assessmentOptions=assessmentOptions
      save=(action nothing)
      close=(action nothing)
    }}`);

    const aamcMethod = '[data-test-aamc-method]';
    const aamcMethodSelect = `${aamcMethod} select`;
    const aamcMethodOptions = `${aamcMethodSelect} option`;
    const firstAamcMethodOption = `${aamcMethodOptions}:nth-of-type(1)`;
    const secondAamcMethodOption = `${aamcMethodOptions}:nth-of-type(2)`;
    const assessment = '[data-test-assessment]';
    const assessmentInput = `${assessment} .toggle-yesno`;

    assert.dom(aamcMethodSelect).hasValue('');
    assert.dom(aamcMethodOptions).exists({ count: 2 });
    assert.dom(firstAamcMethodOption).hasValue('');
    assert.dom(secondAamcMethodOption).hasValue('AM001');

    await click(assessmentInput);

    assert.dom(aamcMethodSelect).hasValue('');
    assert.dom(aamcMethodOptions).exists({ count: 2 });
    assert.dom(firstAamcMethodOption).hasValue('');
    assert.dom(secondAamcMethodOption).hasValue('IM001');
  });

  test('assessment option hidden when assessment is false', async function(assert) {
    this.set('assessmentOptions', []);
    this.set('nothing', () => {});
    await render(hbs`{{school-session-type-form
      title='one'
      calendarColor='#ffffff'
      assessment=false
      assessmentOption=null
      assessmentOptions=assessmentOptions
      save=(action nothing)
      close=(action nothing)
    }}`);

    const title = '[data-test-title]';
    const color = '[data-test-color]';
    const assessment = '[data-test-assessment]';
    const assessmentOption = '[data-test-assessment-option]';

    assert.dom(title).exists({ count: 1 });
    assert.dom(color).exists({ count: 1 });
    assert.dom(assessment).exists({ count: 1 });
    assert.dom(assessment).isNotChecked();
    assert.dom(assessmentOption).doesNotExist();
  });

  test('cancel fires action', async function(assert) {
    assert.expect(1);
    this.set('assessmentOptions', []);
    this.set('nothing', () => {});
    this.set('close', ()=>{
      assert.ok(true, 'action was fired');
    });
    await render(hbs`{{school-session-type-form
      title='one'
      calendarColor='#ffffff'
      assessment=false
      assessmentOption=null
      assessmentOptions=assessmentOptions
      canUpdate=true
      save=(action nothing)
      close=(action close)
    }}`);

    const button = '.cancel';
    await click(button);
  });

  test('close fires action', async function(assert) {
    assert.expect(1);
    this.set('assessmentOptions', []);
    this.set('nothing', () => {});
    this.set('close', ()=>{
      assert.ok(true, 'action was fired');
    });
    await render(hbs`{{school-session-type-form
      title='one'
      calendarColor='#ffffff'
      assessment=false
      assessmentOption=null
      assessmentOptions=assessmentOptions
      canUpdate=false
      save=(action nothing)
      close=(action close)
    }}`);

    const button = '.text';
    await click(button);
  });

  test('save fires save', async function(assert) {
    assert.expect(9);
    const method = this.server.create('aamc-method', {
      id: 'AM001',
      description: "lorem ipsum"
    });

    const formative = this.server.create('assessment-option', {
      name: 'formative'
    });
    const aamcMethodModel = await run(() => this.owner.lookup('service:store').find('aamc-method', method.id));
    const assessmentOptionModel = await run(() => this.owner.lookup('service:store').find('assessment-option', formative.id));

    this.set('nothing', () => {});
    this.set('save', (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      assert.equal(title, 'new title', 'title is correct');
      assert.equal(calendarColor, '#a1b2c3', 'color is correct');
      assert.equal(assessment, true, 'assessment is picked');
      assert.equal(assessmentOption, assessmentOptionModel, 'correct assessmentOption is sent');
      assert.equal(aamcMethod, aamcMethodModel, 'correct aamcMethod is sent');
      assert.equal(isActive, false, 'correct isActive value is sent');
    });
    await render(hbs`{{school-session-type-form
      title='one'
      calendarColor='#ffffff'
      assessment=true
      canEditTitle=true
      canEditAamcMethod=true
      canEditCalendarColor=true
      canEditAssessment=true
      canEditAssessmentOption=true
      canEditActive=true
      isActive=true
      canUpdate=true
      save=(action save)
      close=(action nothing)
    }}`);

    const title = '[data-test-title]';
    const titleInput = `${title} input`;
    const aamcMethod = '[data-test-aamc-method]';
    const aamcMethodSelect = `${aamcMethod} select`;
    const color = '[data-test-color]';
    const colorInput = `${color} input`;
    const assessmentOption = '[data-test-assessment-option]';
    const assessmentOptionSelect = `${assessmentOption} select`;
    const isActive = '[data-test-active]';
    const isActiveInput = `${isActive} input`;
    const isActiveControl = `${isActive} .toggle-yesno`;
    const button = '.done';

    assert.dom(isActiveInput).isChecked('active is selected');

    fillIn(titleInput, 'new title');
    fillIn(aamcMethodSelect, aamcMethodModel.id);
    fillIn(colorInput, '#a1b2c3');
    fillIn(assessmentOptionSelect, '1');

    assert.dom(isActiveInput).isChecked('active is selected');
    await click(isActiveControl);
    assert.dom(isActiveInput).isNotChecked('active is not selected');
    await click(button);
  });

  test('editing is blocked correctly', async function(assert) {
    this.server.create('aamc-method', {
      id: 'AM001',
      description: "lorem ipsum"
    });

    this.server.create('assessment-option', {
      name: 'formative'
    });

    this.set('nothing', () => {});
    await render(hbs`{{school-session-type-form
      canEditTitle=false
      canEditAamcMethod=false
      canEditCalendarColor=false
      canEditAssessment=false
      canEditAssessmentOption=false
      canEditActive=false
      title='one'
      selectedAamcMethodId='AM001'
      calendarColor='#ffffff'
      assessment=true
      selectedAssessmentOptionId='1'
      save=(action nothing)
      close=(action nothing)
    }}`);

    const title = '[data-test-title]';
    const titleInput = `${title} input`;
    const titleValue = `${title} .value`;
    const aamcMethod = '[data-test-aamc-method]';
    const aamcMethodSelect = `${aamcMethod} select`;
    const aamcMethodValue = `${aamcMethod} .value`;
    const color = '[data-test-color]';
    const colorBox = '[data-test-color] .box';
    const colorInput = `${color} input`;
    const colorValue = `${color} .value`;
    const assessment = '[data-test-assessment]';
    const assessmentInput = `${assessment} input`;
    const assessmentValue = `${assessment} .value`;
    const assessmentOption = '[data-test-assessment-option]';
    const assessmentOptionSelect = `${assessmentOption} select`;
    const assessmentOptionValue = `${assessmentOption} .value`;
    const active = '[data-test-active]';
    const activeInput = `${active} input`;
    const activeValue = `${active} .value`;

    assert.dom(titleInput).doesNotExist();
    assert.dom(aamcMethodSelect).doesNotExist();
    assert.dom(colorInput).doesNotExist();
    assert.dom(assessmentInput).doesNotExist();
    assert.dom(assessmentOptionSelect).doesNotExist();
    assert.dom(activeInput).doesNotExist();

    assert.dom(titleValue).hasText('one');
    assert.dom(aamcMethodValue).hasText('lorem ipsum');
    assert.dom(colorValue).hasText('#ffffff');
    assert.equal(find(colorBox).style.backgroundColor.trim(), ('rgb(255, 255, 255)'));
    assert.dom(assessmentValue).hasText('Yes');
    assert.dom(assessmentOptionValue).hasText('formative');
    assert.dom(activeValue).hasText('Yes');
  });
});
