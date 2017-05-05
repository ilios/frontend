import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
const { Object:EmberObject } = Ember;
moduleForComponent('school-session-type-form', 'Integration | Component | school session type form', {
  integration: true
});

test('it renders', function(assert) {
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
  this.render(hbs`{{school-session-type-form
    canEditTitle=true
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

  const title = '.item:eq(0)';
  const titleInput = `${title} input`;
  const color = '.item:eq(1)';
  const colorInput = `${color} input`;
  const assessment = '.item:eq(2)';
  const assessmentInput = `${assessment} input`;
  const assessmentOption = '.item:eq(3)';
  const assessmentOptionSelect = `${assessmentOption} select`;

  assert.equal(this.$(titleInput).val().trim(), 'one');
  assert.equal(this.$(colorInput).val().trim(), '#ffffff');
  assert.ok(this.$(assessmentInput).is(':checked'));
  assert.equal(this.$(assessmentOptionSelect).val(), '2');
});

test('assessment option hidden when assessment is false', function(assert) {
  this.set('assessmentOptions', []);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-type-form
    title='one'
    calendarColor='#ffffff'
    assessment=false
    assessmentOption=null
    assessmentOptions=assessmentOptions
    save=(action nothing)
    close=(action nothing)
  }}`);

  const title = '.item:eq(0)';
  const color = '.item:eq(1)';
  const assessment = '.item:eq(2)';
  const assessmentOption = '.item:eq(3)';

  assert.equal(this.$(title).length, 1);
  assert.equal(this.$(color).length, 1);
  assert.equal(this.$(assessment).length, 1);
  assert.ok(this.$(assessment).not(':checked'));
  assert.equal(this.$(assessmentOption).length, 0);
});

test('close fires action', function(assert) {
  assert.expect(1);
  this.set('assessmentOptions', []);
  this.set('nothing', parseInt);
  this.set('close', ()=>{
    assert.ok(true, 'action was fired');
  });
  this.render(hbs`{{school-session-type-form
    title='one'
    calendarColor='#ffffff'
    assessment=false
    assessmentOption=null
    assessmentOptions=assessmentOptions
    save=(action nothing)
    close=(action close)
  }}`);

  const button = '.cancel';

  this.$(button).click();
});

test('save fires save', function(assert) {
  assert.expect(4);
  const formative = EmberObject.create({
    id: '1',
    name: 'formative'
  });
  const summative = EmberObject.create({
    id: '2',
    name: 'summative'
  });
  const assessmentOptions = [formative, summative];
  this.set('assessmentOption', summative);
  this.set('assessmentOptions', assessmentOptions);
  this.set('nothing', parseInt);
  this.set('save', (title, calendarColor, assessment, assessmentOption) => {
    assert.equal(title, 'new title');
    assert.equal(calendarColor, '#a1b2c3');
    assert.equal(assessment, true);
    assert.equal(assessmentOption, formative);
  });
  this.render(hbs`{{school-session-type-form
    title='one'
    calendarColor='#ffffff'
    assessment=true
    assessmentOption=assessmentOption
    assessmentOptions=assessmentOptions
    canEditTitle=true
    canEditCalendarColor=true
    canEditAssessment=true
    canEditAssessmentOption=true
    save=(action save)
    close=(action nothing)
  }}`);

  const title = '.item:eq(0)';
  const titleInput = `${title} input`;
  const color = '.item:eq(1)';
  const colorInput = `${color} input`;
  const assessmentOption = '.item:eq(3)';
  const assessmentOptionSelect = `${assessmentOption} select`;
  const button = '.done';

  this.$(titleInput).val('new title').change();
  this.$(colorInput).val('#a1b2c3').change();
  this.$(assessmentOptionSelect).val(1).change();

  this.$(button).click();
});

test('editing is blocked correctly', function(assert) {
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
  this.render(hbs`{{school-session-type-form
    canEditTitle=false
    canEditCalendarColor=false
    canEditAssessment=false
    canEditAssessmentOption=false
    title='one'
    calendarColor='#ffffff'
    assessment=true
    assessmentOption=assessmentOption
    assessmentOptions=assessmentOptions
    save=(action nothing)
    close=(action nothing)
  }}`);

  const title = '.item:eq(0)';
  const titleInput = `${title} input`;
  const titleValue = `${title} .value`;
  const color = '.item:eq(1)';
  const colorBox = '.item:eq(1) .box';
  const colorInput = `${color} input`;
  const colorValue = `${color} .value`;
  const assessment = '.item:eq(2)';
  const assessmentInput = `${assessment} input`;
  const assessmentValue = `${assessment} .value`;
  const assessmentOption = '.item:eq(3)';
  const assessmentOptionSelect = `${assessmentOption} select`;
  const assessmentOptionValue = `${assessmentOption} .value`;

  assert.equal(this.$(titleInput).length, 0);
  assert.equal(this.$(colorInput).length, 0);
  assert.equal(this.$(assessmentInput).length, 0);
  assert.equal(this.$(assessmentOptionSelect).length, 0);

  assert.equal(this.$(titleValue).text().trim(), 'one');
  assert.equal(this.$(colorValue).text().trim(), '#ffffff');
  assert.equal(this.$(colorBox).css('background-color').trim(), ('rgb(255, 255, 255)'));
  assert.equal(this.$(assessmentValue).text().trim(), 'Yes');
  assert.equal(this.$(assessmentOptionValue).text().trim(), 'summative');
});
