import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/new-sequence-block';

module('Integration | Component | curriculum-inventory/new-sequence-block', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school,
    });
    const report = this.server.create('curriculum-inventory-report', {
      year: '2016',
      program,
      isFinalized: false,
    });
    const academicLevels = [];
    for (let i = 1; i <= 10; i++) {
      academicLevels.push(
        this.server.create('curriculum-inventory-academic-level', {
          report,
          level: i,
        })
      );
    }
    this.academicLevels = academicLevels;
    this.report = report;
    this.school = school;
  });

  test('it renders', async function (assert) {
    this.server.create('course', {
      school: this.school,
      published: true,
      title: 'Unlinked Course 1',
      year: '2016',
    });
    this.server.create('course', {
      school: this.school,
      published: true,
      title: 'Unlinked Course 2',
      year: '2016',
    });
    const course = this.server.create('course', {
      school: this.school,
      published: true,
      title: 'Linked Course',
      year: '2016',
    });
    this.server.create('curriculum-inventory-sequence-block', {
      course,
      report: this.report,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @cancel={{(noop)}} @save={{(noop)}} />`
    );

    assert.strictEqual(component.title.label, 'Title:');
    assert.strictEqual(component.title.value, '');
    assert.strictEqual(component.description.label, 'Description:');
    assert.strictEqual(component.description.value, '');
    assert.strictEqual(component.course.label, 'Course:');
    assert.strictEqual(component.course.options.length, 3);
    assert.strictEqual(component.course.options[0].text, 'Select a Course');
    assert.strictEqual(component.course.options[1].text, 'Unlinked Course 1');
    assert.strictEqual(component.course.options[2].text, 'Unlinked Course 2');
    assert.strictEqual(component.required.label, 'Required:');
    assert.strictEqual(component.required.options.length, 3);
    assert.strictEqual(component.required.options[0].value, '1');
    assert.strictEqual(component.required.options[0].text, 'Required');
    assert.strictEqual(component.required.options[1].value, '2');
    assert.strictEqual(component.required.options[1].text, 'Optional (elective)');
    assert.strictEqual(component.required.options[2].value, '3');
    assert.strictEqual(component.required.options[2].text, 'Required In Track');
    assert.strictEqual(component.track.label, 'Is Track?');
    assert.strictEqual(component.track.yesNoToggle.checked, 'false');
    assert.strictEqual(component.startDate.label, 'Start Date:');
    assert.strictEqual(component.startDate.value, '');
    assert.strictEqual(component.endDate.label, 'End Date:');
    assert.strictEqual(component.endDate.value, '');
    assert.strictEqual(component.duration.label, 'Duration (in Days):');
    assert.strictEqual(component.duration.value, '0');
    assert.strictEqual(component.minimum.label, 'Minimum:');
    assert.strictEqual(component.minimum.value, '0');
    assert.strictEqual(component.maximum.label, 'Maximum:');
    assert.strictEqual(component.maximum.value, '0');
    assert.strictEqual(component.startLevel.label, 'Start Level:');
    assert.strictEqual(component.startLevel.options.length, 10);
    assert.strictEqual(component.startLevel.options[0].text, 'Year 0');
    assert.strictEqual(component.startLevel.options[1].text, 'Year 1');
    assert.strictEqual(component.startLevel.options[2].text, 'Year 2');
    assert.strictEqual(component.startLevel.options[3].text, 'Year 3');
    assert.strictEqual(component.startLevel.options[4].text, 'Year 4');
    assert.strictEqual(component.startLevel.options[5].text, 'Year 5');
    assert.strictEqual(component.startLevel.options[6].text, 'Year 6');
    assert.strictEqual(component.startLevel.options[7].text, 'Year 7');
    assert.strictEqual(component.startLevel.options[8].text, 'Year 8');
    assert.strictEqual(component.startLevel.options[9].text, 'Year 9');
    assert.strictEqual(component.endLevel.label, 'End Level:');
    assert.strictEqual(component.endLevel.options.length, 10);
    assert.strictEqual(component.endLevel.options[0].text, 'Year 0');
    assert.strictEqual(component.endLevel.options[1].text, 'Year 1');
    assert.strictEqual(component.endLevel.options[2].text, 'Year 2');
    assert.strictEqual(component.endLevel.options[3].text, 'Year 3');
    assert.strictEqual(component.endLevel.options[4].text, 'Year 4');
    assert.strictEqual(component.endLevel.options[5].text, 'Year 5');
    assert.strictEqual(component.endLevel.options[6].text, 'Year 6');
    assert.strictEqual(component.endLevel.options[7].text, 'Year 7');
    assert.strictEqual(component.endLevel.options[8].text, 'Year 8');
    assert.strictEqual(component.endLevel.options[9].text, 'Year 9');
    assert.strictEqual(component.childSequenceOrder.label, 'Child Sequence Order:');
    assert.strictEqual(component.childSequenceOrder.options.length, 3);
    assert.strictEqual(component.childSequenceOrder.options[0].value, '1');
    assert.strictEqual(component.childSequenceOrder.options[0].text, 'Ordered');
    assert.strictEqual(component.childSequenceOrder.options[1].value, '2');
    assert.strictEqual(component.childSequenceOrder.options[1].text, 'Unordered');
    assert.strictEqual(component.childSequenceOrder.options[2].value, '3');
    assert.strictEqual(component.childSequenceOrder.options[2].text, 'Parallel');
    assert.notOk(component.orderInSequence.isVisible);
  });

  test('order-in-sequence options are visible for ordered parent sequence block', async function (assert) {
    assert.expect(25);
    const parent = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
      report: this.report,
    });
    this.server.createList('curriculum-inventory-sequence-block', 10, {
      report: this.report,
      parent,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const parentModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', parent.id);
    this.set('report', reportModel);
    this.set('parentBlock', parentModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @parent={{this.parentBlock}} @cancel={{(noop)}} @save={{(noop)}} />`
    );

    assert.ok(component.orderInSequence.isVisible);
    assert.strictEqual(component.orderInSequence.label, 'Order in Sequence:');
    assert.strictEqual(component.orderInSequence.options.length, 11);
    for (let i = 0; i < 11; i++) {
      assert.strictEqual(component.orderInSequence.options[i].value, (i + 1).toString());
      assert.strictEqual(component.orderInSequence.options[i].text, (i + 1).toString());
    }
  });

  test('selecting course reveals additional course info', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type');
    const course = this.server.create('course', {
      school: this.school,
      year: '2016',
      published: true,
      title: 'my fancy course',
      clerkshipType,
      startDate: new Date('2016-03-01'),
      endDate: new Date('2016-03-02'),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @cancel={{(noop)}} @save={{(noop)}} />`
    );

    assert.notOk(component.course.details.isVisible);
    await component.course.select(courseModel.id);
    assert.ok(component.course.details.isVisible);
    assert.strictEqual(
      component.course.details.text,
      'Level: 1, Start Date: 2016-03-01, End Date: 2016-03-02 -Clerkship (clerkship type 0)'
    );
  });

  test('save with defaults', async function (assert) {
    assert.expect(16);
    const newTitle = 'new sequence block';
    const newDescription = 'lorem ipsum';
    const newStartDate = new Date('2016-01-05');
    const newEndDate = new Date('2016-02-12');
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.set('save', (block) => {
      assert.strictEqual(block.title, newTitle);
      assert.strictEqual(block.description, newDescription);
      assert.strictEqual(block.belongsTo('parent').id(), null);
      assert.strictEqual(block.belongsTo('startingAcademicLevel').id(), this.academicLevels[0].id);
      assert.strictEqual(block.belongsTo('endingAcademicLevel').id(), this.academicLevels[0].id);
      assert.strictEqual(parseInt(block.required, 10), 1);
      assert.notOk(block.track);
      assert.strictEqual(parseInt(block.orderInSequence, 10), 0);
      assert.strictEqual(parseInt(block.childSequenceOrder, 10), 1);
      assert.strictEqual(block.startDate.getTime(), newStartDate.getTime());
      assert.strictEqual(block.endDate.getTime(), newEndDate.getTime());
      assert.strictEqual(parseInt(block.minimum, 10), 0);
      assert.strictEqual(parseInt(block.minimum, 10), 0);
      assert.strictEqual(block.belongsTo('course').id(), null);
      assert.strictEqual(parseInt(block.duration, 10), 0);
      assert.strictEqual(block.belongsTo('report').id(), reportModel.id);
    });

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{this.save}} @cancel={{(noop)}} />`
    );

    await component.title.set(newTitle);
    await component.description.set(newDescription);
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    await component.save();
  });

  test('save with non-defaults', async function (assert) {
    assert.expect(11);
    const newStartDate = new Date('2016-01-05');
    const newEndDate = new Date('2016-02-12');
    const minimum = 10;
    const maximum = 12;
    const duration = 6;
    const course = this.server.create('course', {
      year: '2016',
      published: true,
      school: this.school,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('report', reportModel);
    this.set('save', (block) => {
      assert.strictEqual(parseInt(block.belongsTo('startingAcademicLevel').id(), 10), 2);
      assert.strictEqual(parseInt(block.belongsTo('endingAcademicLevel').id(), 10), 3);
      assert.strictEqual(parseInt(block.required, 10), 3);
      assert.ok(block.track);
      assert.strictEqual(parseInt(block.childSequenceOrder, 10), 2);
      assert.strictEqual(block.startDate.getTime(), newStartDate.getTime());
      assert.strictEqual(block.endDate.getTime(), newEndDate.getTime());
      assert.strictEqual(parseInt(block.minimum, 10), minimum);
      assert.strictEqual(parseInt(block.maximum, 10), maximum);
      assert.strictEqual(block.belongsTo('course').id(), courseModel.id);
      assert.strictEqual(parseInt(block.duration, 10), duration);
    });

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{this.save}} @cancel={{(noop)}} />`
    );

    await component.title.set('foo bar');
    await component.description.set('lorem ipsum');
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    await component.duration.set(duration);
    await component.minimum.set(minimum);
    await component.maximum.set(maximum);
    await component.course.select(courseModel.id);
    await component.childSequenceOrder.select('2');
    await component.required.select('3');
    await component.startLevel.select('2');
    await component.endLevel.select('3');
    await component.track.yesNoToggle.click();
    await component.save();
  });

  test('save nested block in ordered sequence', async function (assert) {
    assert.expect(4);
    const parent = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
      report: this.report,
      startingAcademicLevel: this.academicLevels[0],
      endingAcademicLevel: this.academicLevels[1],
    });
    this.server.create('curriculum-inventory-sequence-block', {
      report: this.report,
      parent,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const parentModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-sequence-block', parent.id);
    this.set('report', reportModel);
    this.set('parentBlock', parentModel);
    this.set('save', (block) => {
      assert.strictEqual(block.orderInSequence, 2);
      assert.strictEqual(block.belongsTo('parent').id(), parent.id);
      assert.strictEqual(parseInt(block.belongsTo('startingAcademicLevel').id(), 10), 1);
      assert.strictEqual(parseInt(block.belongsTo('endingAcademicLevel').id(), 10), 2);
    });

    await render(hbs`<CurriculumInventory::NewSequenceBlock
      @report={{this.report}}
      @parent={{this.parentBlock}}
      @save={{this.save}}
      @cancel={{(noop)}}
    />`);

    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.orderInSequence.select('2');
    await component.startDate.set(new Date('2016-01-05'));
    await component.endDate.set(new Date('2016-02-12'));
    await component.duration.set('19');
    await component.save();
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action was invoked.');
    });

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{this.cancel}} />`
    );

    await component.cancel();
  });

  test('clear dates', async function (assert) {
    const newStartDate = new Date('2016-01-12');
    const newEndDate = new Date('2017-02-22');
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(component.startDate.value, '');
    assert.strictEqual(component.endDate.value, '');
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    assert.strictEqual(
      component.startDate.value,
      DateTime.fromJSDate(newStartDate).toFormat('M/d/yyyy')
    );
    assert.strictEqual(
      component.endDate.value,
      DateTime.fromJSDate(newEndDate).toFormat('M/d/yyyy')
    );
    await component.clearDates();
    assert.strictEqual(component.startDate.value, '');
    assert.strictEqual(component.endDate.value, '');
  });

  test('save fails when minimum is larger than maximum', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(component.maximum.errors.length, 0);
    await component.minimum.set('10');
    await component.maximum.set('5');
    await component.save();
    assert.strictEqual(component.maximum.errors.length, 1);
    assert.strictEqual(
      component.maximum.errors[0].text,
      'Maximum must be greater than or equal to Minimum'
    );
  });

  test('save fails when minimum is less than zero', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(component.minimum.errors.length, 0);
    await component.minimum.set('-1');
    await component.save();
    assert.strictEqual(component.minimum.errors.length, 1);
  });

  test('save fails when minimum is empty', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(component.minimum.errors.length, 0);
    await component.minimum.set('');
    await component.save();
    assert.strictEqual(component.minimum.errors.length, 1);
  });

  test('save fails when maximum is empty', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    assert.strictEqual(component.maximum.errors.length, 0);
    await component.maximum.set('');
    await component.save();
    assert.strictEqual(component.maximum.errors.length, 1);
  });

  test('save with date range and a zero duration', async function (assert) {
    assert.expect(3);
    const newStartDate = new Date('2016-01-12');
    const newEndDate = new Date('2017-02-22');
    const newDuration = 0;
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.set('save', (block) => {
      assert.strictEqual(block.startDate.getTime(), newStartDate.getTime());
      assert.strictEqual(block.endDate.getTime(), newEndDate.getTime());
      assert.strictEqual(parseInt(block.duration, 10), newDuration);
    });

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{this.save}} @cancel={{(noop)}} />`
    );
    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.startDate.set(newStartDate);
    await component.endDate.set(newEndDate);
    await component.duration.set(newDuration);
    await component.save();
  });

  test('save with non-zero duration and no date range', async function (assert) {
    assert.expect(3);
    const newDuration = 10;
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);
    this.set('save', (block) => {
      assert.strictEqual(block.startDate, undefined);
      assert.strictEqual(block.endDate, undefined);
      assert.strictEqual(parseInt(block.duration, 10), newDuration);
    });
    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{this.save}} @cancel={{(noop)}} />`
    );
    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.duration.set(newDuration);
    await component.save();
  });

  test('save fails if end-date is older than start-date', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.startDate.set(new Date('2016-11-12'));
    await component.endDate.set(new Date('2011-12-30'));
    await component.save();
    assert.strictEqual(component.startDate.errors.length, 0);
    assert.strictEqual(component.endDate.errors.length, 1);
  });

  test('save fails on missing duration', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.startDate.set(new Date('2016-11-12'));
    await component.endDate.set(new Date('2016-12-30'));
    await component.duration.set('');
    await component.save();
    assert.strictEqual(component.duration.errors.length, 2);
  });

  test('save fails on invalid duration', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.startDate.set(new Date('2016-11-12'));
    await component.endDate.set(new Date('2016-12-30'));
    await component.duration.set('WRONG');
    await component.save();
    assert.strictEqual(component.duration.errors.length, 3);
  });

  test('save fails if neither date range nor non-zero duration is provided', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.duration.set('');
    await component.save();
    assert.strictEqual(component.duration.errors.length, 2);
  });

  test('save fails if linked course is clerkship and start date is not provided', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type');
    const course = this.server.create('course', {
      school: this.school,
      year: '2016',
      published: true,
      title: 'my fancy course',
      clerkshipType,
      startDate: new Date('2016-03-01'),
      endDate: new Date('2016-03-02'),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );
    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.duration.set('10');
    await component.course.select(courseModel.id);
    await component.save();
    assert.strictEqual(component.startDate.errors.length, 1);
    assert.strictEqual(component.endDate.errors.length, 0);
    assert.strictEqual(component.duration.errors.length, 0);
  });

  test('save fails if linked course is clerkship and duration is zero', async function (assert) {
    const clerkshipType = this.server.create('course-clerkship-type');
    const course = this.server.create('course', {
      school: this.school,
      year: '2016',
      published: true,
      title: 'my fancy course',
      clerkshipType,
      startDate: new Date('2016-03-01'),
      endDate: new Date('2016-03-02'),
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );
    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.startDate.set(new Date('2016-11-12'));
    await component.endDate.set(new Date('2016-12-30'));
    await component.duration.set('0');
    await component.course.select(courseModel.id);
    await component.save();
    assert.strictEqual(component.startDate.errors.length, 0);
    assert.strictEqual(component.endDate.errors.length, 0);
    assert.strictEqual(component.duration.errors.length, 1);
    assert.strictEqual(
      component.duration.errors[0].text,
      'Duration must be greater than or equal to 1'
    );
  });

  test('save fails if start-date is given but no end-date is provided', async function (assert) {
    const reportModel = await this.owner
      .lookup('service:store')
      .findRecord('curriculum-inventory-report', this.report.id);
    this.set('report', reportModel);

    await render(
      hbs`<CurriculumInventory::NewSequenceBlock @report={{this.report}} @save={{(noop)}} @cancel={{(noop)}} />`
    );

    await component.title.set('Foo Bar');
    await component.description.set('Lorem Ipsum');
    await component.startDate.set(new Date());
    await component.save();
    assert.strictEqual(component.endDate.errors.length, 2);
  });
});
