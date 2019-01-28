import EmberObject from '@ember/object';
import { htmlSafe } from '@ember/string';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  find,
  click
} from '@ember/test-helpers';
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

    assert.dom(firstTitle).hasText('first');
    assert.dom(firstSessionCount).hasText('2');
    assert.dom(firstAssessment).hasClass('no');
    assert.dom(firstAssessment).hasClass('fa-ban');
    assert.dom(firstAssessmentOption).hasText('');
    assert.equal(find(firstColorBox).style.getPropertyValue('background-color').trim(), ('rgb(204, 204, 204)'));

    assert.dom(secondTitle).hasText('second');
    assert.dom(secondSessionCount).hasText('0');
    assert.dom(secondAssessment).hasClass('yes');
    assert.dom(secondAssessment).hasClass('fa-check');
    assert.dom(secondAssessmentOption).hasText('formative');
    assert.equal(find(secondColorBox).style.getPropertyValue('background-color').trim(), ('rgb(18, 52, 86)'));

    assert.ok(find(thirdTitle).textContent.trim().startsWith('not needed anymore'));
    assert.ok(find(thirdTitle).textContent.trim().endsWith('(inactive)'));
    assert.dom(thirdSessionCount).hasText('2');
    assert.dom(thirdAssessment).hasClass('no');
    assert.dom(thirdAssessment).hasClass('fa-ban');
    assert.dom(thirdAssessmentOption).hasText('');
    assert.equal(find(thirdColorBox).style.getPropertyValue('background-color').trim(), ('rgb(255, 255, 255)'));
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

    await click(edit);
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

    await click(title);
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

    assert.dom(linkedTitle).hasText('linked', 'linked is first');
    assert.dom(unlinkedTitle).hasText('unlinked', 'unlinked is second');
    assert.dom(linkedTrash).doesNotExist('linked has no trash can');
    assert.dom(unlinkedTrash).exists({ count: 1 }, 'unlinked has a trash can');
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

    await click(trash);
    await settled();
  });
});
