import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  find
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | curriculum inventory report details', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school
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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));

    this.set('report', report);
    this.set('nothing', () =>{});

    await render(hbs`{{curriculum-inventory-report-details
      report=report
      canUpdate=true
      setLeadershipDetails=(action nothing)
      setManageLeadership=(action nothing)
    }}`);

    return settled().then(() => {
      assert.dom('.curriculum-inventory-report-header .title').hasText(report.get('name'), 'Report name is visible in header.');
      assert.dom('.curriculum-inventory-report-overview .description .editable').hasText(report.get('description'), 'Report description is visible in overview.');
    });
  });

  test('finalize report', async function(assert) {
    assert.expect(6);
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school
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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    this.set('report', report);
    this.set('nothing', () => { });
    this.set('canUpdate', true);

    await render(hbs`{{curriculum-inventory-report-details
      report=report
      canUpdate=canUpdate
      setLeadershipDetails=(action nothing)
      setManageLeadership=(action nothing)
    }}`);

    assert.dom('.confirm-finalize').doesNotExist('Confirmation dialog is initially not visible.');
    await click('.curriculum-inventory-report-header .finalize');
    assert.dom('.confirm-finalize').exists({ count: 1 }, 'Confirmation dialog is visible.');
    assert.ok(
      find('.confirm-finalize .confirm-message').textContent.trim().indexOf('By finalizing this report') === 0,
      'Finalize confirmation message is visible'
    );
    await click('.confirm-finalize .confirm-buttons .finalize');
    this.set('canUpdate', false);
    assert.dom('.confirm-finalize').doesNotExist('Confirmation dialog is not visible post-finalization.');
    assert.dom('.curriculum-inventory-report-header .title .fa-lock').exists({ count: 1 }, 'Lock icon is visible next to title post-finalization.');
    assert.dom('.curriculum-inventory-report-header .finalize').isDisabled('Finalize button has been disabled post-finalization.');
  });

  test('start finalizing report, then cancel', async function(assert){
    assert.expect(3);
    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school
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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));

    this.set('report', report);
    this.set('nothing', () =>{});

    await render(hbs`{{curriculum-inventory-report-details
      report=report
      canUpdate=true
      setLeadershipDetails=(action nothing)
      setManageLeadership=(action nothing)
    }}`);

    await click('.curriculum-inventory-report-header .finalize');
    await click('.confirm-finalize .confirm-buttons .done');
    assert.dom('.confirm-finalize').doesNotExist('Confirmation dialog is not visible post-cancellation.');
    assert.dom('.curriculum-inventory-report-header .title .fa-lock').doesNotExist('Lock icon is not visible post-cancellation.');
    assert.dom('.curriculum-inventory-report-header .finalize').exists({ count: 1 }, 'Finalize button is visible post-cancellation.');
  });
});
