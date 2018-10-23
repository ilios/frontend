import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll, fillIn } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import tHelper from "ember-intl/helper";
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const {resolve} = RSVP;

module('Integration | Component | curriculum inventory report overview', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:intl').setLocale('en');
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
      assert.equal(find('.title').textContent.trim(), 'Overview',
        'Component title is visible.'
      );
      assert.equal(findAll('.report-overview-actions .rollover').length, 1,
        'Rollover course button is visible.'
      );
      assert.equal(find('.start-date label').textContent.trim(), 'Start:',
        'Start date label is correct.'
      );
      assert.equal(find('.start-date .editinplace').textContent.trim(),
        moment(report.get('startDate')).format('L'), 'Start date is visible.'
      );
      assert.equal(find('.end-date label').textContent.trim(), 'End:',
        'End date label is correct.'
      );
      assert.equal(find('.end-date .editinplace').textContent.trim(),
        moment(report.get('endDate')).format('L'), 'End date is visible.'
      );
      assert.equal(find('.academic-year label').textContent.trim(), 'Academic Year:',
        'Academic year label is correct.'
      );
      assert.equal(find('.academic-year .editinplace').textContent.trim(),
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1), 'Academic year is visible.'
      );
      assert.equal(find('.program label').textContent.trim(), 'Program:',
        'Program label is correct.'
      );
      assert.equal(find('.program > span').textContent.trim(),
        `${program.get('title')} (${program.get('shortTitle')})`, 'Program is visible.'
      );

      assert.equal(find('.description label').textContent.trim(), 'Description:',
        'Description label is correct.'
      );
      assert.equal(find('.description .editinplace').textContent.trim(),
        report.get('description'), 'Description is visible.'
      );
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
      assert.equal(find('.start-date > span').textContent.trim(),
        moment(report.get('startDate')).format('L'), 'Start date is visible.'
      );
      assert.equal(find('.end-date > span').textContent.trim(),
        moment(report.get('endDate')).format('L'), 'End date is visible.'
      );
      assert.equal(find('.academic-year > span').textContent.trim(),
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1), 'Academic year is visible.'
      );
      assert.equal(find('.program > span').textContent.trim(),
        `${program.get('title')} (${program.get('shortTitle')})`, 'Program is visible.'
      );
      assert.equal(find('.description > span').textContent.trim(),
        report.get('description'), 'Description is visible.'
      );
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
      assert.equal(findAll('.report-overview-actions .rollover').length, 0,
        'Rollover course button is not visible.'
      );
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
        assert.equal(find('.start-date input').value, moment(report.get('startDate')).format('L'),
          "The report's current start date is pre-selected in date picker."
        );
        let newVal = moment('2015-04-01');
        interactor.selectDate(newVal.toDate());
        await click('.start-date .actions .done');
        return settled().then(() => {
          assert.equal(find('.start-date .editinplace').textContent.trim(), newVal.format('L'),
            'Edit link shown new start date post-update.'
          );
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
        assert.equal(findAll('.start-date .validation-error-message').length, 0,
          'Initially, no validation error is visible.'
        );
        await click('.start-date .actions .done');
        return settled().then(() => {
          assert.equal(findAll('.start-date .validation-error-message').length, 1,
            'Validation failed, error message is visible.'
          );
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
        assert.equal(find('.end-date input').value, moment(report.get('endDate')).format('L'),
          "The report's current end date is pre-selected in date picker."
        );
        let newVal = moment('2016-05-01');
        interactor.selectDate(newVal.toDate());
        await click('.end-date .actions .done');
        return settled().then(() => {
          assert.equal(find('.end-date .editinplace').textContent.trim(), newVal.format('L'),
            'Edit link shown new end date post-update.'
          );
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
        assert.equal(findAll('.end-date .validation-error-message').length, 0,
          'Initially, no validation error is visible.'
        );
        await click('.end-date .actions .done');
        return settled().then(() => {
          assert.equal(findAll('.end-date .validation-error-message').length, 1,
            'Validation failed, error message is visible.'
          );
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
        assert.equal(findAll('.academic-year option').length, 11, 'There should be ten options in year dropdown.');
        assert.equal(find('.academic-year option:checked').value, report.get('year'),
          "The report's year should be selected."
        );
        const newVal = report.get('year') + 1;
        await fillIn('.academic-year select', newVal);
        await click('.academic-year .actions .done');
        return settled().then(() => {
          assert.equal(find('.academic-year .editinplace').textContent.trim(), `${newVal} - ${newVal + 1}`,
            'New year is visible on edit-link.'
          );
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
      assert.equal(find('.academic-year > span').textContent.trim(),
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1), 'Academic year is visible.'
      );
      assert.equal(findAll('.academic-year .editinplace').length, 0,
        'Academic year is not editable in place.'
      );
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
      assert.equal(find('.description .editinplace').textContent.trim(), 'Click to edit');
      await click('.description .editinplace .editable');
      return settled().then(async () => {
        const newDescription = 'Quidquid luce fuit, tenebris agit.';
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert.equal(find('.description .editinplace').textContent.trim(), newDescription);
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
      assert.equal(find('.description .editinplace').textContent.trim(), 'Click to edit');
      await click('.description .editinplace .editable');
      return settled().then(async () => {
        assert.equal(findAll('.description .validation-error-message').length, 0,
          'Validation error is initially not shown.'
        );
        const newDescription = '0123456789'.repeat(5000);
        await fillIn('.description textarea', newDescription);
        await click('.description .actions .done');
        return settled().then(() => {
          assert.equal(findAll('.description .validation-error-message').length, 1, 'Validation error message is visible.');
        });
      });
    });
  });
});
