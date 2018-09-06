import EmberObject from '@ember/object';
import { htmlSafe } from '@ember/string';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, findAll } from '@ember/test-helpers';
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
    const firstSessionType = `${rows}:nth-of-type(1)`;
    const firstTitle = `${firstSessionType} td:nth-of-type(1)`;
    const firstSessionCount = `${firstSessionType} td:nth-of-type(2)`;
    const firstAssessment = `${firstSessionType} td:nth-of-type(3) svg`;
    const firstAssessmentOption = `${firstSessionType} td:nth-of-type(4)`;
    const firstColorBox = `${firstSessionType} td:nth-of-type(6) .box`;
    const secondSessionType = `${rows}:nth-of-type(2)`;
    const secondTitle = `${secondSessionType} td:nth-of-type(1)`;
    const secondSessionCount = `${secondSessionType} td:nth-of-type(2)`;
    const secondAssessment = `${secondSessionType} td:nth-of-type(3) svg`;
    const secondAssessmentOption = `${secondSessionType} td:nth-of-type(4)`;
    const secondColorBox = `${secondSessionType} td:nth-of-type(6) .box`;
    const thirdSessionType = `${rows}:nth-of-type(3)`;
    const thirdTitle = `${thirdSessionType} td:nth-of-type(1)`;
    const thirdSessionCount = `${thirdSessionType} td:nth-of-type(2)`;
    const thirdAssessment = `${thirdSessionType} td:nth-of-type(3) svg`;
    const thirdAssessmentOption = `${thirdSessionType} td:nth-of-type(4)`;
    const thirdColorBox = `${thirdSessionType} td:nth-of-type(6) .box`;

    assert.equal(find(firstTitle).textContent.trim(), 'first');
    assert.equal(find(firstSessionCount).textContent.trim(), '2');
    assert.ok(find(firstAssessment).hasClass('no'));
    assert.ok(find(firstAssessment).hasClass('fa-ban'));
    assert.equal(find(firstAssessmentOption).textContent.trim(), '');
    assert.equal(find(firstColorBox).css('background-color').trim(), ('rgb(204, 204, 204)'));

    assert.equal(find(secondTitle).textContent.trim(), 'second');
    assert.equal(find(secondSessionCount).textContent.trim(), '0');
    assert.ok(find(secondAssessment).hasClass('yes'));
    assert.ok(find(secondAssessment).hasClass('fa-check'));
    assert.equal(find(secondAssessmentOption).textContent.trim(), 'formative');
    assert.equal(find(secondColorBox).css('background-color').trim(), ('rgb(18, 52, 86)'));

    assert.ok(find(thirdTitle).textContent.trim().startsWith('not needed anymore'));
    assert.ok(find(thirdTitle).textContent.trim().endsWith('(inactive)'));
    assert.equal(find(thirdSessionCount).textContent.trim(), '2');
    assert.ok(find(thirdAssessment).hasClass('no'));
    assert.ok(find(thirdAssessment).hasClass('fa-ban'));
    assert.equal(find(thirdAssessmentOption).textContent.trim(), '');
    assert.equal(find(thirdColorBox).css('background-color').trim(), ('rgb(255, 255, 255)'));
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
    const edit = `${rows}:nth-of-type(1) td:nth-of-type(7) .fa-edit`;

    find(edit).click();
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
    const title = `${rows}:nth-of-type(1) td:nth-of-type(1) a`;

    find(title).click();
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
    const linkedTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const unlinkedTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const linkedTrash = `${rows}:nth-of-type(1) td:nth-of-type(7) .fa-trash`;
    const unlinkedTrash = `${rows}:nth-of-type(2) td:nth-of-type(7) .fa-trash`;

    assert.equal(find(linkedTitle).textContent.trim(), 'linked', 'linked is first');
    assert.equal(find(unlinkedTitle).textContent.trim(), 'unlinked', 'unlinked is second');
    assert.equal(findAll(linkedTrash).length, 0, 'linked has no trash can');
    assert.equal(findAll(unlinkedTrash).length, 1, 'unlinked has a trash can');
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
    const trash = `${rows}:nth-of-type(1) td:nth-of-type(7) .fa-trash`;

    find(trash).click();
    await settled();
  });
});
