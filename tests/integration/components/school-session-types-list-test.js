import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | school session types list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(21);
    const school = this.server.create('school');
    const assessmentOption = this.server.create('assessment-option', {
      id: 1,
      name: 'formative'
    });
    const aamcMethod1 = this.server.create('aamc-method', {
      id: 'AM001',
      description: 'Lorem Ipsum',
      active: true,
    });
    const aamcMethod2 = this.server.create('aamc-method', {
      id: 'AM002',
      description: 'Dolor Et',
      active: false,
    });
    this.server.create('session-type', {
      school,
      title: 'not needed anymore',
      assessment: false,
      calendarColor: '#ffffff',
      aamcMethods: [aamcMethod1],
      sessions: this.server.createList('session', 2),
      active: false,
    });

    this.server.create('session-type', {
      school,
      title: 'second',
      assessment: true,
      assessmentOption,
      calendarColor: '#123456',
      aamcMethods: [aamcMethod2],
      active: true,
    });
    this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#cccccc',
      aamcMethods: [aamcMethod1],
      sessions: this.server.createList('session', 2),
      active: true,
    });

    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');
    this.set('sessionTypes', sessionTypeModels);
    await render(hbs`<SchoolSessionTypesList @sessionTypes={{this.sessionTypes}} @manageSessionType={{noop}} />`);

    const rows = 'table tbody tr';
    const firstSessionType = `${rows}:nth-of-type(1)`;
    const firstTitle = `${firstSessionType} td:nth-of-type(1)`;
    const firstSessionCount = `${firstSessionType} td:nth-of-type(2)`;
    const firstAssessment = `${firstSessionType} td:nth-of-type(3) svg`;
    const firstAssessmentOption = `${firstSessionType} td:nth-of-type(4)`;
    const firstAamcMethod = `${firstSessionType} td:nth-of-type(5)`;
    const firstColorBox = `${firstSessionType} td:nth-of-type(6) .box`;
    const secondSessionType = `${rows}:nth-of-type(2)`;
    const secondTitle = `${secondSessionType} td:nth-of-type(1)`;
    const secondSessionCount = `${secondSessionType} td:nth-of-type(2)`;
    const secondAssessment = `${secondSessionType} td:nth-of-type(3) svg`;
    const secondAssessmentOption = `${secondSessionType} td:nth-of-type(4)`;
    const secondAamcMethod = `${secondSessionType} td:nth-of-type(5)`;
    const secondColorBox = `${secondSessionType} td:nth-of-type(6) .box`;
    const thirdSessionType = `${rows}:nth-of-type(3)`;
    const thirdTitle = `${thirdSessionType} td:nth-of-type(1)`;
    const thirdSessionCount = `${thirdSessionType} td:nth-of-type(2)`;
    const thirdAssessment = `${thirdSessionType} td:nth-of-type(3) svg`;
    const thirdAssessmentOption = `${thirdSessionType} td:nth-of-type(4)`;
    const thirdAamcMethod = `${thirdSessionType} td:nth-of-type(5)`;
    const thirdColorBox = `${thirdSessionType} td:nth-of-type(6) .box`;

    assert.dom(firstTitle).hasText('first');
    assert.dom(firstSessionCount).hasText('2');
    assert.dom(firstAssessment).hasClass('no');
    assert.dom(firstAssessment).hasClass('fa-ban');
    assert.dom(firstAamcMethod).hasText(aamcMethod1.description);
    assert.dom(firstAssessmentOption).hasText('');
    assert.dom(firstColorBox).hasStyle({
      'background-color': 'rgb(204, 204, 204)'
    });

    assert.dom(secondTitle).hasText('second');
    assert.dom(secondSessionCount).hasText('0');
    assert.dom(secondAssessment).hasClass('yes');
    assert.dom(secondAssessment).hasClass('fa-check');
    assert.dom(secondAamcMethod).hasText(aamcMethod2.description + ' (inactive)');
    assert.dom(secondAssessmentOption).hasText('formative');
    assert.dom(secondColorBox).hasStyle({
      'background-color': 'rgb(18, 52, 86)'
    });

    assert.dom(thirdTitle).hasText('not needed anymore (inactive)');
    assert.dom(thirdSessionCount).hasText('2');
    assert.dom(thirdAssessment).hasClass('no');
    assert.dom(thirdAssessment).hasClass('fa-ban');
    assert.dom(thirdAamcMethod).hasText(aamcMethod1.description);
    assert.dom(thirdAssessmentOption).hasText('');
    assert.dom(thirdColorBox).hasStyle({
      'background-color': 'rgb(255, 255, 255)'
    });
  });

  test('clicking edit fires action', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#fff'
    });
    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');

    this.set('sessionTypes', sessionTypeModels);
    this.set('manageSessionType', sessionTypeId => {
      assert.equal(sessionTypeId, 1);
    });
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{this.manageSessionType}}
    />`);

    const rows = 'table tbody tr';
    const edit = `${rows}:nth-of-type(1) td:nth-of-type(7) .fa-edit`;

    await click(edit);
  });

  test('clicking title fires action', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      title: 'first',
      assessment: false,
      calendarColor: '#fff'
    });
    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');

    this.set('sessionTypes', sessionTypeModels);
    this.set('manageSessionType', sessionTypeId => {
      assert.equal(sessionTypeId, 1);
    });
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{this.manageSessionType}}
    />`);

    const rows = 'table tbody tr';
    const title = `${rows}:nth-of-type(1) td:nth-of-type(1) [data-test-title]`;

    await click(title);
  });

  test('session types without sessions can be deleted', async function(assert) {
    assert.expect(4);

    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      title: 'unlinked',
      assessment: false,
      active: true,
      calendarColor: '#fff'
    });
    this.server.create('session-type', {
      school,
      title: 'linked',
      active: true,
      assessment: false,
      calendarColor: '#fff',
      sessions: this.server.createList('session', 5),
    });

    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');
    this.set('sessionTypes', sessionTypeModels);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{noop}}
      @canDelete={{true}}
    />`);

    const rows = 'table tbody tr';
    const linkedTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const unlinkedTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const linkedTrash = `${rows}:nth-of-type(1) td:nth-of-type(7) .fa-trash.disabled`;
    const unlinkedTrash = `${rows}:nth-of-type(2) td:nth-of-type(7) .fa-trash.enabled`;

    assert.dom(linkedTitle).hasText('linked', 'linked is first');
    assert.dom(unlinkedTitle).hasText('unlinked', 'unlinked is second');
    assert.dom(linkedTrash).exists({ count: 1 }, 'linked has a disabled trash can');
    assert.dom(unlinkedTrash).exists({ count: 1 }, 'unlinked has an enabled trash can');
  });

  test('clicking delete deletes the record', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
    });

    const sessionTypeModels = await this.owner.lookup('service:store').findAll('session-type');

    this.set('sessionTypes', sessionTypeModels);
    await render(hbs`<SchoolSessionTypesList
      @sessionTypes={{this.sessionTypes}}
      @manageSessionType={{noop}}
      @canDelete={{true}}
    />`);

    const rows = 'table tbody tr';
    const trash = `${rows}:nth-of-type(1) td:nth-of-type(7) .fa-trash`;

    assert.equal(this.server.db.sessionTypes.length, 1);
    await click(trash);
    assert.equal(this.server.db.sessionTypes.length, 0);
  });
});
