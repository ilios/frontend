import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import Service from '@ember/service';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/report-details';

module('Integration | Component | curriculum-inventory/report-details', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return true;
      },
    });
    this.owner.register('service:permission-checker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school,
    });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', report);
    await render(hbs`<CurriculumInventory::ReportDetails
      @report={{this.report}}
      @canUpdate={{true}}
      @setLeadershipDetails={{(noop)}}
      @setManageLeadership={{(noop)}}
    />`);
    assert.strictEqual(component.header.name.text, reportModel.name);
    assert.strictEqual(component.overview.description.text, reportModel.description);
  });

  test('finalize report', async function (assert) {
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school,
    });
    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);
    this.set('report', reportModel);
    this.set('canUpdate', true);
    await render(hbs`<CurriculumInventory::ReportDetails
      @report={{this.report}}
      @canUpdate={{this.canUpdate}}
      @setLeadershipDetails={{(noop)}}
      @setManageLeadership={{(noop)}}
    />`);

    assert.notOk(
      component.finalizeConfirmation.isVisible,
      'Confirmation dialog is initially not visible.'
    );
    await component.header.finalize();
    assert.ok(component.finalizeConfirmation.isVisible, 'Confirmation dialog is visible.');
    assert.strictEqual(
      find('.confirm-finalize .confirm-message')
        .textContent.trim()
        .indexOf('By finalizing this report'),
      0,
      'Finalize confirmation message is visible'
    );
    await click('.confirm-finalize .confirm-buttons .finalize');
    this.set('canUpdate', false);
    assert
      .dom('.confirm-finalize')
      .doesNotExist('Confirmation dialog is not visible post-finalization.');
    assert
      .dom('.curriculum-inventory-report-header .title .fa-lock')
      .exists({ count: 1 }, 'Lock icon is visible next to title post-finalization.');
    assert
      .dom('.curriculum-inventory-report-header .finalize')
      .isDisabled('Finalize button has been disabled post-finalization.');
  });

  test('start finalizing report, then cancel', async function (assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school,
    });
    this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
    });
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);

    this.set('report', report);

    await render(hbs`<CurriculumInventory::ReportDetails
      @report={{this.report}}
      @canUpdate={{true}}
      @setLeadershipDetails={{(noop)}}
      @setManageLeadership={{(noop)}}
    />`);

    await click('.curriculum-inventory-report-header .finalize');
    await click('.confirm-finalize .confirm-buttons .done');
    assert
      .dom('.confirm-finalize')
      .doesNotExist('Confirmation dialog is not visible post-cancellation.');
    assert
      .dom('.curriculum-inventory-report-header .title .fa-lock')
      .doesNotExist('Lock icon is not visible post-cancellation.');
    assert
      .dom('.curriculum-inventory-report-header .finalize')
      .exists({ count: 1 }, 'Finalize button is visible post-cancellation.');
  });
});
