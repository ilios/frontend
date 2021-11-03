import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/new-report';

module('Integration | Component | curriculum-inventory/new-report', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const currentYear = parseInt(moment().format('YYYY'), 10);

    this.set('program', programModel);
    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(
      component.programTitle.label,
      'Program:',
      'program title is labeled correctly.'
    );
    assert.strictEqual(component.programTitle.title, program.title, 'Program title is displayed.');
    assert.strictEqual(
      component.academicYear.label,
      'Academic Year:',
      'Academic year input is labeled correctly.'
    );
    assert.strictEqual(
      component.academicYear.options.length,
      11,
      'Academic year dropdown has eleven options.'
    );
    assert.strictEqual(
      component.academicYear.value,
      currentYear,
      'Current year is selected by default.'
    );
    assert.strictEqual(
      component.academicYear.options[0].value,
      currentYear - 5,
      'First year in dropdown is five years prior to current year.'
    );
    assert.strictEqual(
      component.academicYear.options[0].text,
      currentYear - 5,
      'First year label is correct.'
    );
    assert.strictEqual(
      component.academicYear.options[10].value,
      currentYear + 5,
      'Last year in dropdown is five years ahead of current year.'
    );
    assert.strictEqual(
      component.academicYear.options[10].text,
      currentYear + 5,
      'Last year label is correct.'
    );
    assert.strictEqual(component.description.value, 'Curriculum Inventory Report');
    assert.strictEqual(
      component.description.label,
      'Description:',
      'Description input is labeled correctly.'
    );
    assert.strictEqual(component.name.value, '', 'Name input is initially empty.');
    assert.strictEqual(component.name.label, 'Name:', 'Name input is labeled correctly.');
  });

  test('academic year options labeled as range when app configuration is set to cross calendar-year boundaries', async function (assert) {
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const currentYear = parseInt(moment().format('YYYY'), 10);

    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('program', programModel);

    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(
      component.academicYear.options[0].text,
      `${currentYear - 5} - ${currentYear - 4}`,
      'First year label is correct.'
    );
    assert.strictEqual(
      component.academicYear.options[10].text,
      `${currentYear + 5} - ${currentYear + 6}`,
      'Last year label is correct.'
    );
  });

  test('save', async function (assert) {
    assert.expect(6);
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const currentYear = parseInt(moment().format('YYYY'), 10);
    const expectedSelectedYear = currentYear - 5;

    this.set('program', programModel);
    this.set('save', (report) => {
      assert.strictEqual(report.get('name'), 'new report', 'Name gets passed.');
      assert.strictEqual(report.get('description'), 'lorem ipsum', 'Description gets passed.');
      assert.strictEqual(
        report.get('year'),
        expectedSelectedYear,
        'Selected academic year gets passed.'
      );
      assert.strictEqual(
        moment(report.get('startDate')).format('YYYY-MM-DD'),
        `${expectedSelectedYear}-01-01`,
        'Start date gets calculated and passed.'
      );
      assert.strictEqual(
        moment(report.get('endDate')).format('YYYY-MM-DD'),
        `${expectedSelectedYear}-12-31`,
        'End date gets calculated and passed.'
      );
      assert.ok(report.get('program'), 'Program gets passed.');
      return true;
    });

    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{this.save}} @cancel={{(noop)}} />`
    );
    await component.name.set('new report');
    await component.description.set('lorem ipsum');
    await component.academicYear.select(expectedSelectedYear);
    await component.save();
  });

  test('save with academic year crossing calendar-year boundaries', async function (assert) {
    assert.expect(2);
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const currentYear = parseInt(moment().format('YYYY'), 10);
    const expectedSelectedYear = currentYear - 5;

    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.set('program', programModel);
    this.set('save', (report) => {
      assert.strictEqual(
        moment(report.get('startDate')).format('YYYY-MM-DD'),
        `${expectedSelectedYear}-07-01`,
        'Start date gets calculated and passed.'
      );
      assert.strictEqual(
        moment(report.get('endDate')).format('YYYY-MM-DD'),
        `${expectedSelectedYear + 1}-06-30`,
        'End date gets calculated and passed.'
      );
      return true;
    });

    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{this.save}} @cancel={{(noop)}} />`
    );
    await component.name.set('new report');
    await component.description.set('lorem ipsum');
    await component.academicYear.select(expectedSelectedYear);
    await component.save();
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action got invoked.');
    });
    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @cancel={{this.cancel}} @save={{(noop)}} />`
    );
    await component.cancel();
  });

  test('pressing enter in name input field fires save action', async function (assert) {
    assert.expect(1);
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('save', () => {
      assert.ok(true, 'Save action got invoked.');
      return true;
    });

    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{this.save}} @cancel={{(noop)}} />`
    );
    await component.name.set('new report');
    await component.name.submit();
  });

  test('validation errors do not show up initially', async function (assert) {
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    this.set('program', programModel);
    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{(noop)}} @cancel={{(noop)}}/>`
    );
    assert.notOk(component.name.hasError);
  });

  test('validation errors show up when saving with empty report name', async function (assert) {
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    this.set('program', programModel);
    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{(noop)}} @cancel={{(noop)}}/>`
    );
    await component.save();
    assert.ok(component.name.hasError);
  });

  test('validation errors show up when saving with a too long report name', async function (assert) {
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{(noop)}} @cancel={{(noop)}}/>`
    );
    await component.name.set('0123456789'.repeat(7));
    await component.save();
    assert.ok(component.name.hasError);
  });

  test('validation errors show if description is blank', async function (assert) {
    const program = this.server.create('program', { id: 1, title: 'Doctor of Medicine' });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    this.set('program', programModel);

    await render(
      hbs`<CurriculumInventory::NewReport @currentProgram={{this.program}} @save={{(noop)}} @cancel={{(noop)}}/>`
    );

    assert.notOk(component.description.hasError);
    await component.description.set('');
    await component.save();
    assert.ok(component.description.hasError);
  });
});
