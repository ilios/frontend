import EmberObject from '@ember/object';
import { htmlSafe } from '@ember/string';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school session types list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(19);
    let assessmentOption = EmberObject.create({
      id: 1,
      name: 'formative'
    });
    let sessionType1 = EmberObject.create({
      id: 1,
      school: 1,
      title: 'not needed anymore',
      assessment: false,
      assessmentOption: resolve(null),
      safeCalendarColor: htmlSafe('#ffffff'),
      sessionCount: 2,
      active: false,
    });

    let sessionType2 = EmberObject.create({
      id: 2,
      school: 1,
      title: 'second',
      assessment: true,
      assessmentOption: resolve(assessmentOption),
      safeCalendarColor: htmlSafe('#123456'),
      sessionCount: 0,
      active: true,
    });
    let sessionType3 = EmberObject.create({
      id: 2,
      school: 1,
      title: 'first',
      assessment: false,
      assessmentOption: resolve(null),
      safeCalendarColor: htmlSafe('#cccccc'),
      sessionCount: 2,
      active: true,
    });


    this.set('sessionTypes', [sessionType1, sessionType2, sessionType3]);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-types-list
      sessionTypes=sessionTypes
      manageSessionType=(action nothing)
    }}`);

    await settled();

    const rows = 'table tbody tr';
    const firstSessionType = `${rows}:eq(0)`;
    const firstTitle = `${firstSessionType} td:eq(0)`;
    const firstSessionCount = `${firstSessionType} td:eq(1)`;
    const firstAssessment = `${firstSessionType} td:eq(2) svg`;
    const firstAssessmentOption = `${firstSessionType} td:eq(3)`;
    const firstColorBox = `${firstSessionType} td:eq(5) .box`;
    const secondSessionType = `${rows}:eq(1)`;
    const secondTitle = `${secondSessionType} td:eq(0)`;
    const secondSessionCount = `${secondSessionType} td:eq(1)`;
    const secondAssessment = `${secondSessionType} td:eq(2) svg`;
    const secondAssessmentOption = `${secondSessionType} td:eq(3)`;
    const secondColorBox = `${secondSessionType} td:eq(5) .box`;
    const thirdSessionType = `${rows}:eq(2)`;
    const thirdTitle = `${thirdSessionType} td:eq(0)`;
    const thirdSessionCount = `${thirdSessionType} td:eq(1)`;
    const thirdAssessment = `${thirdSessionType} td:eq(2) svg`;
    const thirdAssessmentOption = `${thirdSessionType} td:eq(3)`;
    const thirdColorBox = `${thirdSessionType} td:eq(5) .box`;

    assert.equal(this.$(firstTitle).text().trim(), 'first');
    assert.equal(this.$(firstSessionCount).text().trim(), '2');
    assert.ok(this.$(firstAssessment).hasClass('no'));
    assert.ok(this.$(firstAssessment).hasClass('fa-ban'));
    assert.equal(this.$(firstAssessmentOption).text().trim(), '');
    assert.equal(this.$(firstColorBox).css('background-color').trim(), ('rgb(204, 204, 204)'));

    assert.equal(this.$(secondTitle).text().trim(), 'second');
    assert.equal(this.$(secondSessionCount).text().trim(), '0');
    assert.ok(this.$(secondAssessment).hasClass('yes'));
    assert.ok(this.$(secondAssessment).hasClass('fa-check'));
    assert.equal(this.$(secondAssessmentOption).text().trim(), 'formative');
    assert.equal(this.$(secondColorBox).css('background-color').trim(), ('rgb(18, 52, 86)'));

    assert.ok(this.$(thirdTitle).text().trim().startsWith('not needed anymore'));
    assert.ok(this.$(thirdTitle).text().trim().endsWith('(inactive)'));
    assert.equal(this.$(thirdSessionCount).text().trim(), '2');
    assert.ok(this.$(thirdAssessment).hasClass('no'));
    assert.ok(this.$(thirdAssessment).hasClass('fa-ban'));
    assert.equal(this.$(thirdAssessmentOption).text().trim(), '');
    assert.equal(this.$(thirdColorBox).css('background-color').trim(), ('rgb(255, 255, 255)'));
  });

  test('clicking edit fires action', async function(assert) {
    assert.expect(1);
    let  sessionType = EmberObject.create({
      id: 1,
      school: 1,
      title: 'first',
      assessment: false,
      assessmentOption: resolve(null),
      calendarColor: '#fff'
    });

    this.set('sessionTypes', [sessionType]);
    this.set('manageSessionType', sessionTypeId => {
      assert.equal(sessionTypeId, 1);
    });
    await render(hbs`{{school-session-types-list
      sessionTypes=sessionTypes
      manageSessionType=(action manageSessionType)
    }}`);

    await settled();
    const rows = 'table tbody tr';
    const edit = `${rows}:eq(0) td:eq(6) .fa-edit`;

    this.$(edit).click();
  });

  test('clicking title fires action', async function(assert) {
    assert.expect(1);
    let  sessionType = EmberObject.create({
      id: 1,
      school: 1,
      title: 'first',
      assessment: false,
      assessmentOption: resolve(null),
      calendarColor: '#fff'
    });

    this.set('sessionTypes', [sessionType]);
    this.set('manageSessionType', sessionTypeId => {
      assert.equal(sessionTypeId, 1);
    });
    await render(hbs`{{school-session-types-list
      sessionTypes=sessionTypes
      manageSessionType=(action manageSessionType)
    }}`);

    await settled();
    const rows = 'table tbody tr';
    const title = `${rows}:eq(0) td:eq(0) a`;

    this.$(title).click();
  });

  test('session types without sessions can be deleted', async function(assert) {
    assert.expect(4);
    let  unlinkedSessionType = EmberObject.create({
      id: 1,
      school: 1,
      title: 'unlinked',
      active: true,
      assessment: false,
      assessmentOption: resolve(null),
      calendarColor: '#fff',
      sessionCount: 0,
      deleteRecord(){
        assert.ok(true, 'was deleted');
        return resolve();
      }
    });
    let  linkedSessionType = EmberObject.create({
      id: 1,
      school: 1,
      title: 'linked',
      active: true,
      assessment: false,
      assessmentOption: resolve(null),
      calendarColor: '#fff',
      sessionCount: 5,
      deleteRecord(){
        assert.ok(true, 'was deleted');
        return resolve();
      }
    });

    this.set('sessionTypes', [linkedSessionType, unlinkedSessionType]);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-types-list
      sessionTypes=sessionTypes
      manageSessionType=(action nothing)
      canDelete=true
    }}`);

    await settled();
    const rows = 'table tbody tr';
    const linkedTitle = `${rows}:eq(0) td:eq(0)`;
    const unlinkedTitle = `${rows}:eq(1) td:eq(0)`;
    const linkedTrash = `${rows}:eq(0) td:eq(6) .fa-trash`;
    const unlinkedTrash = `${rows}:eq(1) td:eq(6) .fa-trash`;

    assert.equal(this.$(linkedTitle).text().trim(), 'linked', 'linked is first');
    assert.equal(this.$(unlinkedTitle).text().trim(), 'unlinked', 'unlinked is second');
    assert.equal(this.$(linkedTrash).length, 0, 'linked has no trash can');
    assert.equal(this.$(unlinkedTrash).length, 1, 'unlinked has a trash can');
  });

  test('clicking delete deletes the record', async function(assert) {
    assert.expect(2);
    let  sessionType = EmberObject.create({
      id: 1,
      school: 1,
      title: 'first',
      assessment: false,
      assessmentOption: resolve(null),
      calendarColor: '#fff',
      sessionCount: 0,
      deleteRecord(){
        assert.ok(true, 'was deleted');
      },
      save(){
        assert.ok(true, 'was deleted');
        return resolve();
      },
    });

    this.set('sessionTypes', [sessionType]);
    this.set('nothing', parseInt);
    await render(hbs`{{school-session-types-list
      sessionTypes=sessionTypes
      manageSessionType=(action nothing)
      canDelete=true
    }}`);

    await settled();
    const rows = 'table tbody tr';
    const trash = `${rows}:eq(0) td:eq(6) .fa-trash`;

    this.$(trash).click();
    await settled();
  });
});
