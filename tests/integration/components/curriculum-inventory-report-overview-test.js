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


    const currentUserMock = Service.extend({
      userIsDeveloper: resolve(true)
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      assert.equal(this.$('.title').text().trim(), 'Overview',
        'Component title is visible.'
      );
      assert.equal(this.$('.report-overview-actions .rollover').length, 1,
        'Rollover course button is visible.'
      );
      assert.equal(this.$('.start-date label').text().trim(), 'Start:',
        'Start date label is correct.'
      );
      assert.equal(this.$('.start-date .editinplace').text().trim(),
        moment(report.get('startDate')).format('L'), 'Start date is visible.'
      );
      assert.equal(this.$('.end-date label').text().trim(), 'End:',
        'End date label is correct.'
      );
      assert.equal(this.$('.end-date .editinplace').text().trim(),
        moment(report.get('endDate')).format('L'), 'End date is visible.'
      );
      assert.equal(this.$('.academic-year label').text().trim(), 'Academic Year:',
        'Academic year label is correct.'
      );
      assert.equal(this.$('.academic-year .editinplace').text().trim(),
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1), 'Academic year is visible.'
      );
      assert.equal(this.$('.program label').text().trim(), 'Program:',
        'Program label is correct.'
      );
      assert.equal(this.$('.program > span:eq(0)').text().trim(),
        `${program.get('title')} (${program.get('shortTitle')})`, 'Program is visible.'
      );

      assert.equal(this.$('.description label').text().trim(), 'Description:',
        'Description label is correct.'
      );
      assert.equal(this.$('.description .editinplace').text().trim(),
        report.get('description'), 'Description is visible.'
      );
    });
  });

  test('read-only/finalized mode', async function(assert) {
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
      isFinalized: true,
      name: 'Lorem Ipsum',
      startDate: moment('2015-06-12').toDate(),
      endDate: moment('2016-04-11').toDate(),
      description: 'Lorem Ipsum',
      sequenceBlocks: resolve([])
    });

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-details report=report}}`);
    return settled().then(() => {
      assert.equal(this.$('.start-date > span:eq(0)').text().trim(),
        moment(report.get('startDate')).format('L'), 'Start date is visible.'
      );
      assert.equal(this.$('.end-date > span:eq(0)').text().trim(),
        moment(report.get('endDate')).format('L'), 'End date is visible.'
      );
      assert.equal(this.$('.academic-year > span:eq(0)').text().trim(),
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1), 'Academic year is visible.'
      );
      assert.equal(this.$('.program > span:eq(0)').text().trim(),
        `${program.get('title')} (${program.get('shortTitle')})`, 'Program is visible.'
      );
      assert.equal(this.$('.description > span:eq(0)').text().trim(),
        report.get('description'), 'Description is visible.'
      );
    });
  });

  test('rollover button not visible for non-developer user', async function(assert) {
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

    const currentUserMock = Service.extend({
      userIsDeveloper: resolve(false)
    });
    this.owner.register('service:current-user', currentUserMock);
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-details report=report}}`);
    return settled().then(() => {
      assert.equal(this.$('.report-overview-actions .rollover').length, 0,
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      this.$('.start-date .editinplace .editable').click();
      return settled().then(() => {
        let interactor = openDatepicker(this.$('.start-date input'));
        assert.equal(this.$('.start-date input').val(), moment(report.get('startDate')).format('L'),
          "The report's current start date is pre-selected in date picker."
        );
        let newVal = moment('2015-04-01');
        interactor.selectDate(newVal.toDate());
        this.$('.start-date .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.start-date .editinplace').text().trim(), newVal.format('L'),
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      this.$('.start-date .editinplace .editable').click();
      return settled().then(() => {
        let interactor = openDatepicker(this.$('.start-date input'));
        let newVal = moment(report.get('endDate')).add(1, 'day');
        interactor.selectDate(newVal.toDate());
        assert.equal(this.$('.start-date .validation-error-message').length, 0,
          'Initially, no validation error is visible.'
        );
        this.$('.start-date .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.start-date .validation-error-message').length, 1,
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      this.$('.end-date .editinplace .editable').click();
      return settled().then(() => {
        let interactor = openDatepicker(this.$('.end-date input'));
        assert.equal(this.$('.end-date input').val(), moment(report.get('endDate')).format('L'),
          "The report's current end date is pre-selected in date picker."
        );
        let newVal = moment('2016-05-01');
        interactor.selectDate(newVal.toDate());
        this.$('.end-date .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.end-date .editinplace').text().trim(), newVal.format('L'),
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      this.$('.end-date .editinplace .editable').click();
      return settled().then(() => {
        let interactor = openDatepicker(this.$('.end-date input'));
        let newVal = moment(report.get('startDate')).subtract(1, 'day');
        interactor.selectDate(newVal.toDate());
        assert.equal(this.$('.end-date .validation-error-message').length, 0,
          'Initially, no validation error is visible.'
        );
        this.$('.end-date .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.end-date .validation-error-message').length, 1,
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      this.$('.academic-year .editinplace .editable').click();
      return settled().then(() => {
        assert.equal(this.$('.academic-year option').length, 11, 'There should be ten options in year dropdown.');
        assert.equal(this.$('.academic-year option:selected').val(), report.get('year'),
          "The report's year should be selected."
        );
        const newVal = report.get('year') + 1;
        this.$('.academic-year select').val(newVal).trigger('change');
        this.$('.academic-year .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.academic-year .editinplace').text().trim(), `${newVal} - ${newVal + 1}`,
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      assert.equal(this.$('.academic-year > span:eq(0)').text().trim(),
        report.get('year') + ' - ' + (parseInt(report.get('year'), 10) + 1), 'Academic year is visible.'
      );
      assert.equal(this.$('.academic-year .editinplace').length, 0,
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      assert.equal(this.$('.description .editinplace').text().trim(), 'Click to edit');
      this.$('.description .editinplace .editable').click();
      return settled().then(() => {
        const newDescription = 'Quidquid luce fuit, tenebris agit.';
        this.$('.description textarea').val(newDescription).trigger('input');
        this.$('.description .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.description .editinplace').text().trim(), newDescription);
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

    await render(hbs`{{curriculum-inventory-report-overview report=report}}`);
    return settled().then(() => {
      assert.equal(this.$('.description .editinplace').text().trim(), 'Click to edit');
      this.$('.description .editinplace .editable').click();
      return settled().then(() => {
        assert.equal(this.$('.description .validation-error-message').length, 0,
          'Validation error is initially not shown.'
        );
        const newDescription = '0123456789'.repeat(5000);
        this.$('.description textarea').val(newDescription).trigger('input');
        this.$('.description .actions .done').click();
        return settled().then(() => {
          assert.equal(this.$('.description .validation-error-message').length, 1, 'Validation error message is visible.');
        });
      });
    });
  });
});