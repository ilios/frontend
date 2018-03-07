import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

let storeMock;

module('Integration | Component | school session type form', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    storeMock = Service.extend({
      findAll(){
        return resolve([]);
      }
    });
    this.owner.register('service:store', storeMock);
  });

  test('it renders', async function(assert) {
    assert.expect(9);
    let aamcMethodMockAssessmentMethod = EmberObject.create({
      id: 'AM001',
      description: "lorem ipsum"
    });
    let aamcMethodMockInstructionalMethod = EmberObject.create({
      id: 'IM001',
      description: "lorem ipsum"
    });
    const formative = EmberObject.create({
      id: 1,
      name: 'formative'
    });
    const summative = EmberObject.create({
      id: 2,
      name: 'summative'
    });
    storeMock.reopen({
      findAll(what){
        if (what === 'assessment-option') {
          return resolve([formative, summative]);
        }
        if (what === 'aamc-method') {
          return resolve([aamcMethodMockAssessmentMethod, aamcMethodMockInstructionalMethod]);
        }

        assert.ok(false, `${what} isn't a valid findAll term here`);
      }
    });


    this.set('assessmentOption', summative);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-type-form
      canEditTitle=true
      canEditAamcMethod=true
      canEditCalendarColor=true
      canEditAssessment=true
      canEditAssessmentOption=true
      title='one'
      calendarColor='#ffffff'
      assessment=true
      isActive=true
      selectedAssessmentOptionId=2
      save=(action nothing)
      close=(action nothing)
    }}`);

    const title = '.item:eq(0)';
    const titleInput = `${title} input`;
    const aamcMethod = '.item:eq(1)';
    const aamcMethodSelect = `${aamcMethod} select`;
    const aamcMethodOptions = `${aamcMethodSelect} option`;
    const firstAamcMethodOption = `${aamcMethodOptions}:eq(0)`;
    const secondAamcMethodOption = `${aamcMethodOptions}:eq(1)`;
    const color = '.item:eq(2)';
    const colorInput = `${color} input`;
    const assessment = '.item:eq(3)';
    const assessmentInput = `${assessment} input`;
    const assessmentOption = '.item:eq(4)';
    const assessmentOptionSelect = `${assessmentOption} select`;
    const isActive = '.item:eq(5)';
    const isActiveInput = `${isActive} input`;
    await settled();

    assert.equal(this.$(titleInput).val().trim(), 'one', 'title is correct');
    assert.equal(this.$(aamcMethodSelect).val(), '', 'corrrect aamc method is selected');
    assert.equal(this.$(aamcMethodOptions).length, 2, 'right number of aamcMethod options');
    assert.equal(this.$(firstAamcMethodOption).val(), '', 'first aamcMethod is blank');
    assert.equal(this.$(secondAamcMethodOption).val(), 'AM001', 'second aamcMethod is filtered correctly');
    assert.equal(this.$(colorInput).val().trim(), '#ffffff', 'color is correct');
    assert.ok(this.$(assessmentInput).is(':checked'), 'assessment is selected');
    assert.ok(this.$(isActiveInput).is(':checked'), 'active is selected');
    assert.equal(this.$(assessmentOptionSelect).val(), '2', 'correct assessment option is selected');
  });

  test('changing assessment changes available aamcMethods', async function(assert) {
    let aamcMethodMockAssessmentMethod = EmberObject.create({
      id: 'AM001',
      description: "AM lorem ipsum"
    });
    let aamcMethodMockInstructionalMethod = EmberObject.create({
      id: 'IM001',
      description: "IM lorem ipsum"
    });

    storeMock.reopen({
      findAll(){
        return resolve([aamcMethodMockAssessmentMethod, aamcMethodMockInstructionalMethod]);
      }
    });

    const formative = EmberObject.create({
      id: 1,
      name: 'formative'
    });
    const summative = EmberObject.create({
      id: 2,
      name: 'summative'
    });
    const assessmentOptions = [formative, summative];
    this.set('assessmentOption', summative);
    this.set('assessmentOptions', assessmentOptions);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-type-form
      canEditTitle=true
      canEditAamcMethod=true
      canEditCalendarColor=true
      canEditAssessment=true
      canEditAssessmentOption=true
      title='one'
      calendarColor='#ffffff'
      assessment=true
      assessmentOption=assessmentOption
      assessmentOptions=assessmentOptions
      save=(action nothing)
      close=(action nothing)
    }}`);

    const aamcMethod = '.item:eq(1)';
    const aamcMethodSelect = `${aamcMethod} select`;
    const aamcMethodOptions = `${aamcMethodSelect} option`;
    const firstAamcMethodOption = `${aamcMethodOptions}:eq(0)`;
    const secondAamcMethodOption = `${aamcMethodOptions}:eq(1)`;
    const assessment = '.item:eq(3)';
    const assessmentInput = `${assessment} .toggle-yesno`;

    await settled();

    assert.equal(this.$(aamcMethodSelect).val(), '');
    assert.equal(this.$(aamcMethodOptions).length, 2);
    assert.equal(this.$(firstAamcMethodOption).val(), '');
    assert.equal(this.$(secondAamcMethodOption).val(), 'AM001');

    this.$(assessmentInput).click();

    await settled();

    assert.equal(this.$(aamcMethodSelect).val(), '');
    assert.equal(this.$(aamcMethodOptions).length, 2);
    assert.equal(this.$(firstAamcMethodOption).val(), '');
    assert.equal(this.$(secondAamcMethodOption).val(), 'IM001');
  });

  test('assessment option hidden when assessment is false', async function(assert) {
    this.set('assessmentOptions', []);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-type-form
      title='one'
      calendarColor='#ffffff'
      assessment=false
      assessmentOption=null
      assessmentOptions=assessmentOptions
      save=(action nothing)
      close=(action nothing)
    }}`);

    const title = '.item:eq(0)';
    const color = '.item:eq(2)';
    const assessment = '.item:eq(3)';
    const assessmentOption = '.item:eq(5)';

    await settled();

    assert.equal(this.$(title).length, 1);
    assert.equal(this.$(color).length, 1);
    assert.equal(this.$(assessment).length, 1);
    assert.ok(this.$(assessment).not(':checked'));
    assert.equal(this.$(assessmentOption).length, 0);
  });

  test('close fires action', async function(assert) {
    assert.expect(1);
    this.set('assessmentOptions', []);
    this.set('nothing', parseInt);
    this.set('close', ()=>{
      assert.ok(true, 'action was fired');
    });
    await render(hbs`{{school-session-type-form
      title='one'
      calendarColor='#ffffff'
      assessment=false
      assessmentOption=null
      assessmentOptions=assessmentOptions
      save=(action nothing)
      close=(action close)
    }}`);

    const button = '.cancel';

    await settled();

    this.$(button).click();
  });

  test('save fires save', async function(assert) {
    assert.expect(9);

    const aamcMethodMock = EmberObject.create({
      id: 'AM001',
      description: "lorem ipsum"
    });
    const assessmentOptionMock = EmberObject.create({
      id: '1',
      name: 'formative'
    });
    storeMock.reopen({
      findAll(what){
        if (what === 'assessment-option') {
          return resolve([assessmentOptionMock]);
        }
        if (what === 'aamc-method') {
          return resolve([aamcMethodMock]);
        }

        assert.ok(false, `${what} isn't a valid findAll term here`);
      }
    });

    this.set('nothing', parseInt);
    this.set('save', (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) => {
      assert.equal(title, 'new title', 'title is correct');
      assert.equal(calendarColor, '#a1b2c3', 'color is correct');
      assert.equal(assessment, true, 'assessment is picked');
      assert.equal(assessmentOption, assessmentOptionMock, 'correct assessmentOption is sent');
      assert.equal(aamcMethod, aamcMethodMock, 'correct aamcMethod is sent');
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
      isActive=true
      save=(action save)
      close=(action nothing)
    }}`);

    const title = '.item:eq(0)';
    const titleInput = `${title} input`;
    const aamcMethod = '.item:eq(1)';
    const aamcMethodSelect = `${aamcMethod} select`;
    const color = '.item:eq(2)';
    const colorInput = `${color} input`;
    const assessmentOption = '.item:eq(4)';
    const assessmentOptionSelect = `${assessmentOption} select`;
    const isActive = '.item:eq(5)';
    const isActiveInput = `${isActive} input`;
    const isActiveControl = `${isActive} .toggle-yesno`;
    const button = '.done';

    await settled();

    assert.ok(this.$(isActiveInput).is(':checked'), 'active is selected');

    this.$(titleInput).val('new title');
    this.$(titleInput).trigger('input');
    this.$(aamcMethodSelect).val(aamcMethodMock.get('id')).change();
    this.$(colorInput).val('#a1b2c3');
    this.$(colorInput).trigger('input');
    this.$(assessmentOptionSelect).val('1').change();

    assert.ok(this.$(isActiveInput).is(':checked'), 'active is selected');
    await this.$(isActiveControl).click();
    await settled();
    assert.notOk(this.$(isActiveInput).is(':checked'), 'active is not selected');

    this.$(button).click();

    await settled();
  });

  test('editing is blocked correctly', async function(assert) {
    const aamcMethodMock = EmberObject.create({
      id: 'AM001',
      description: "lorem ipsum"
    });
    const assessmentOptionMock = EmberObject.create({
      id: '1',
      name: 'formative'
    });
    storeMock.reopen({
      findAll(what){
        if (what === 'assessment-option') {
          return resolve([assessmentOptionMock]);
        }
        if (what === 'aamc-method') {
          return resolve([aamcMethodMock]);
        }

        assert.ok(false, `${what} isn't a valid findAll term here`);
      }
    });
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-type-form
      canEditTitle=false
      canEditAamcMethod=false
      canEditCalendarColor=false
      canEditAssessment=false
      canEditAssessmentOption=false
      title='one'
      selectedAamcMethodId='AM001'
      calendarColor='#ffffff'
      assessment=true
      selectedAssessmentOptionId='1'
      save=(action nothing)
      close=(action nothing)
    }}`);

    const title = '.item:eq(0)';
    const titleInput = `${title} input`;
    const titleValue = `${title} .value`;
    const aamcMethod = '.item:eq(1)';
    const aamcMethodSelect = `${aamcMethod} select`;
    const aamcMethodValue = `${aamcMethod} .value`;
    const color = '.item:eq(2)';
    const colorBox = '.item:eq(2) .box';
    const colorInput = `${color} input`;
    const colorValue = `${color} .value`;
    const assessment = '.item:eq(3)';
    const assessmentInput = `${assessment} input`;
    const assessmentValue = `${assessment} .value`;
    const assessmentOption = '.item:eq(4)';
    const assessmentOptionSelect = `${assessmentOption} select`;
    const assessmentOptionValue = `${assessmentOption} .value`;

    await settled();

    assert.equal(this.$(titleInput).length, 0);
    assert.equal(this.$(aamcMethodSelect).length, 0);
    assert.equal(this.$(colorInput).length, 0);
    assert.equal(this.$(assessmentInput).length, 0);
    assert.equal(this.$(assessmentOptionSelect).length, 0);

    assert.equal(this.$(titleValue).text().trim(), 'one');
    assert.equal(this.$(aamcMethodValue).text().trim(), 'lorem ipsum');
    assert.equal(this.$(colorValue).text().trim(), '#ffffff');
    assert.equal(this.$(colorBox).css('background-color').trim(), ('rgb(255, 255, 255)'));
    assert.equal(this.$(assessmentValue).text().trim(), 'Yes');
    assert.equal(this.$(assessmentOptionValue).text().trim(), 'formative');
  });
});
