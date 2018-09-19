import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  find,
  fillIn
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import tHelper from "ember-i18n/helper";
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const {resolve} = RSVP;

module('Integration | Component | curriculum inventory report overview', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(12);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    const permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return resolve(true);
      }
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(() => {
      assert.dom('.title').hasText('Overview', 'Component title is visible.');
      assert.dom('.report-overview-actions .rollover').exists({ count: 1 }, 'Rollover course button is visible.');
      assert.dom('.start-date label').hasText('Start:', 'Start date label is correct.');
      assert.dom('.start-date .editinplace').hasText(moment(report.get('startDate')).format('L'), 'Start date is visible.');
      assert.dom('.end-date label').hasText('End:', 'End date label is correct.');
      assert.dom('.end-date .editinplace').hasText(moment(report.get('endDate')).format('L'), 'End date is visible.');
      assert.dom('.academic-year label').hasText('Academic Year:', 'Academic year label is correct.');
      assert.dom('.academic-year .editinplace').hasText(
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1),
        'Academic year is visible.'
      );
      assert.dom('.program label').hasText('Program:', 'Program label is correct.');
      assert.dom('.program > span').hasText(
        `${program.get('title')} (${program.get('shortTitle')})`,
        'Program is visible.'
      );

      assert.dom('.description label').hasText('Description:', 'Description label is correct.');
      assert.dom('.description .editinplace').hasText(report.get('description'), 'Description is visible.');
    });
  });

  test('read-only', async function(assert) {
    assert.expect(5);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=false}}`);
    return settled().then(() => {
      assert.dom('.start-date > span').hasText(moment(report.get('startDate')).format('L'), 'Start date is visible.');
      assert.dom('.end-date > span').hasText(moment(report.get('endDate')).format('L'), 'End date is visible.');
      assert.dom('.academic-year > span').hasText(
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1),
        'Academic year is visible.'
      );
      assert.dom('.program > span').hasText(
        `${program.get('title')} (${program.get('shortTitle')})`,
        'Program is visible.'
      );
      assert.dom('.description > span').hasText(report.get('description'), 'Description is visible.');
    });
  });

  test('rollover button not visible for unprivileged user', async function(assert) {
    assert.expect(1);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: true,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    const permissionCheckerMock = Service.extend({
      canCreateCurriculumInventoryReport() {
        return resolve(false);
      }
    });
    this.owner.register('service:permission-checker', permissionCheckerMock);
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(() => {
      assert.dom('.report-overview-actions .rollover').doesNotExist('Rollover course button is not visible.');
    });
  });

  test('change start date', async function(assert) {
    assert.expect(3);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
      save() {
        return resolve(this);
      }
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      await click('.start-date .editinplace .editable');
      return settled().then(async () => {
        let interactor = openDatepicker(find('.start-date input'));
        assert.dom('.start-date input').hasValue(
          moment(report.get('startDate')).format('L'),
          "The report's current start date is pre-selected in date picker."
        );
        let newVal = moment('2015-04-01');
        interactor.selectDate(newVal.toDate());
        await click('.start-date .actions .done');
        return settled().then(() => {
          assert.dom('.start-date .editinplace').hasText(newVal.format('L'), 'Edit link shown new start date post-update.');
          assert.equal(moment(report.get('startDate')).format('YYYY-MM-DD'), newVal.format('YYYY-MM-DD'),
            "The report's start date was updated."
          );
        });
      });
    });
  });

  test('validation fails if given start date follows end date', async function(assert) {
    assert.expect(2);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      await click('.start-date .editinplace .editable');
      return settled().then(async () => {
        let interactor = openDatepicker(find('.start-date input'));
        let newVal = moment(report.get('endDate')).add(1, 'day');
        interactor.selectDate(newVal.toDate());
        assert.dom('.start-date .validation-error-message').doesNotExist('Initially, no validation error is visible.');
        await click('.start-date .actions .done');
        return settled().then(() => {
          assert.dom('.start-date .validation-error-message').exists({ count: 1 }, 'Validation failed, error message is visible.');
        });
      });
    });
  });

  test('change end date', async function(assert) {
    assert.expect(3);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
      save() {
        return resolve(this);
      }
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      await click('.end-date .editinplace .editable');
      return settled().then(async () => {
        let interactor = openDatepicker(find('.end-date input'));
        assert.dom('.end-date input').hasValue(
          moment(report.get('endDate')).format('L'),
          "The report's current end date is pre-selected in date picker."
        );
        let newVal = moment('2016-05-01');
        interactor.selectDate(newVal.toDate());
        await click('.end-date .actions .done');
        return settled().then(() => {
          assert.dom('.end-date .editinplace').hasText(newVal.format('L'), 'Edit link shown new end date post-update.');
          assert.equal(moment(report.get('endDate')).format('YYYY-MM-DD'), newVal.format('YYYY-MM-DD'),
            "The report's end date was updated."
          );
        });
      });
    });
  });

  test('validation fails if given end date precedes end date', async function(assert) {
    assert.expect(2);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      await click('.end-date .editinplace .editable');
      return settled().then(async () => {
        let interactor = openDatepicker(find('.end-date input'));
        let newVal = moment(report.get('startDate')).subtract(1, 'day');
        interactor.selectDate(newVal.toDate());
        assert.dom('.end-date .validation-error-message').doesNotExist('Initially, no validation error is visible.');
        await click('.end-date .actions .done');
        return settled().then(() => {
          assert.dom('.end-date .validation-error-message').exists({ count: 1 }, 'Validation failed, error message is visible.');
        });
      });
    });
  });

  test('change academic year', async function(assert) {
    assert.expect(4);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: parseInt(moment().format('YYYY'), 10),
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      sequenceBlocks: resolve([]),
      description: null,
      save() {
        return resolve(this);
      }
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      await click('.academic-year .editinplace .editable');
      return settled().then(async () => {
        assert.dom('.academic-year option').exists({ count: 11 }, 'There should be ten options in year dropdown.');
        assert.dom('.academic-year option:checked').hasValue(report.get('year'), "The report's year should be selected.");
        const newVal = report.get('year') + 1;
        await fillIn('.academic-year select', newVal);
        await click('.academic-year .actions .done');
        return settled().then(() => {
          assert.dom('.academic-year .editinplace').hasText(`${newVal} - ${newVal + 1}`, 'New year is visible on edit-link.');
          assert.equal(report.get('year'), newVal, 'Report year got updated with new value.');
        });
      });
    });
  });

  test('academic year unchangeable if course has been linked', async function(assert) {
    assert.expect(2);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([]),
      hasLinkedCourses: resolve(true),
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(() => {
      assert.dom('.academic-year > span').hasText(
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1),
        'Academic year is visible.'
      );
      assert.dom('.academic-year .editinplace').doesNotExist('Academic year is not editable in place.');
    });
  });

  test('change description', async function(assert) {
    assert.expect(3);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      sequenceBlocks: resolve([]),
      description: null,
      save() {
        return resolve(this);
      }
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      assert.dom('.description .editinplace').hasText('Click to edit');
      await click('.description .editinplace .editable');
      return settled().then(async () => {
        const newDescription = 'Quidquid luce fuit, tenebris agit.';
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert.dom('.description .editinplace').hasText(newDescription);
          assert.equal(report.get('description'), newDescription);
        });
      });
    });
  });

  test('description validation fails if text is too long', async function(assert) {
    assert.expect(3);

    let school = EmberObject.create({
      id() {
        return 1;
      }
    });

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({id: i, name: `Year ${i + 1}`}));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      },
      title: 'Doctor of Rocket Surgery',
      shortTitle: 'DRS'
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program,
      linkedCourses: resolve([]),
      isFinalized: false,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      sequenceBlocks: resolve([]),
      description: null,
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report canUpdate=true}}`);
    return settled().then(async () => {
      assert.dom('.description .editinplace').hasText('Click to edit');
      await click('.description .editinplace .editable');
      return settled().then(async () => {
        assert.dom('.description .validation-error-message').doesNotExist('Validation error is initially not shown.');
        const newDescription = '0123456789'.repeat(5000);
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert.dom('.description .validation-error-message').exists({ count: 1 }, 'Validation error message is visible.');
        });
      });
    });
  });
});
