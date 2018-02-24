import { getOwner } from '@ember/application';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import tHelper from "ember-i18n/helper";

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory report details', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(2);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-details report=report}}`);

    return settled().then(() => {
      assert.equal(this.$('.curriculum-inventory-report-header .title').text().trim(), report.get('name'),
        'Report name is visible in header.'
      );
      assert.equal(this.$('.curriculum-inventory-report-overview .description .editable').text().trim(), report.get('description'),
        'Report description is visible in overview.'
      );
    });
  });

  test('finalize report', async function(assert) {
    assert.expect(8);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    let storeMock = Service.extend({
      createRecord(what, params) {
        assert.equal(what, 'curriculumInventoryExport', 'createRecord() got invoked for export.');
        assert.equal(params.report, report, 'Report gets passed to correctly.');
        return EmberObject.create({
          save() {
            return resolve(this);
          }
        });
      }
    });

    this.set('report', report);
    this.owner.register('service:store', storeMock);

    await render(hbs`{{curriculum-inventory-report-details report=report}}`);

    await settled();
    assert.equal(this.$('.confirm-finalize').length, 0, 'Confirmation dialog is initially not visible.');
    await this.$('.curriculum-inventory-report-header .finalize').click();
    assert.equal(this.$('.confirm-finalize').length, 1, 'Confirmation dialog is visible.');
    assert.ok(
      this.$('.confirm-finalize .confirm-message').text().trim().indexOf('By finalizing this report') === 0,
      'Finalize confirmation message is visible'
    );
    await this.$('.confirm-finalize .confirm-buttons .finalize').click();
    await settled();
    assert.equal(this.$('.confirm-finalize').length, 0, 'Confirmation dialog is not visible post-finalization.');
    assert.equal(this.$('.curriculum-inventory-report-header .title .fa-lock').length, 1,
      'Lock icon is visible next to title post-finalization.'
    );
    assert.equal(this.$('.curriculum-inventory-report-header .finalize').length, 0,
      'Finalize button is not visible post-finalization.'
    );
  });

  test('start finalizing report, then cancel', async function(assert){
    assert.expect(3);
    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-details report=report}}`);

    await this.$('.curriculum-inventory-report-header .finalize').click();
    await this.$('.confirm-finalize .confirm-buttons .done').click();
    assert.equal(this.$('.confirm-finalize').length, 0, 'Confirmation dialog is not visible post-cancellation.');
    assert.equal(this.$('.curriculum-inventory-report-header .title .fa-lock').length, 0,
      'Lock icon is not visible post-cancellation.'
    );
    assert.equal(this.$('.curriculum-inventory-report-header .finalize').length, 1,
      'Finalize button is visible post-cancellation.'
    );
  });
});