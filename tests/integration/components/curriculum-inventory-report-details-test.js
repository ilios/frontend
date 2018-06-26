import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find } from '@ember/test-helpers';
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
      assert.equal(find('.curriculum-inventory-report-header .title').textContent.trim(), report.get('name'),
        'Report name is visible in header.'
      );
      assert.equal(find('.curriculum-inventory-report-overview .description .editable').textContent.trim(), report.get('description'),
        'Report description is visible in overview.'
      );
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

    assert.equal(findAll('.confirm-finalize').length, 0, 'Confirmation dialog is initially not visible.');
    await click('.curriculum-inventory-report-header .finalize');
    assert.equal(findAll('.confirm-finalize').length, 1, 'Confirmation dialog is visible.');
    assert.ok(
      find('.confirm-finalize .confirm-message').textContent.trim().indexOf('By finalizing this report') === 0,
      'Finalize confirmation message is visible'
    );
    await click('.confirm-finalize .confirm-buttons .finalize');
    this.set('canUpdate', false);
    assert.equal(findAll('.confirm-finalize').length, 0, 'Confirmation dialog is not visible post-finalization.');
    assert.equal(findAll('.curriculum-inventory-report-header .title .fa-lock').length, 1,
      'Lock icon is visible next to title post-finalization.'
    );
    assert.equal(findAll('.curriculum-inventory-report-header .finalize').length, 0,
      'Finalize button is not visible post-finalization.'
    );
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
    assert.equal(findAll('.confirm-finalize').length, 0, 'Confirmation dialog is not visible post-cancellation.');
    assert.equal(findAll('.curriculum-inventory-report-header .title .fa-lock').length, 0,
      'Lock icon is not visible post-cancellation.'
    );
    assert.equal(findAll('.curriculum-inventory-report-header .finalize').length, 1,
      'Finalize button is visible post-cancellation.'
    );
  });
});
