import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  findAll,
  fillIn
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { run } from '@ember/runloop';

module('Integration | Component | curriculum inventory sequence block overview', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(38);

    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school
    });
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });

    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4
    });

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false
    });

    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });

    const academicLevel = academicLevels[0];

    const ilmSessionType = this.server.create('session-type', { title: 'Independent Learning' });
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course,
      title: 'Session A',
      sessionType: ilmSessionType,
      ilmSession,
      published: true,
    });

    const presentationSessionType = this.server.create('session-type', { title: 'Presentation' });
    this.server.create('session', {
      course,
      title: 'Session B',
      sessionType: presentationSessionType,
      published: true,
    });

    const lectureSessionType = this.server.create('session-type', { title: 'Lecture' });
    this.server.create('session', {
      course,
      title: 'Session C',
      sessionType: lectureSessionType,
      published: true,
    });

    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 2));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`
    {{curriculum-inventory-sequence-block-overview
      report=report
      sequenceBlock=sequenceBlock
      canUpdate=true
      sortBy=sortBy
      setSortBy=setSortBy
    }}`);
    assert.dom('.description label').hasText('Description:', 'Description label is correct.');
    assert.dom('.description .editinplace').hasText(block.description, 'Block description is visible.');
    assert.dom('.course label').hasText('Course:', 'Course label is correct.');
    assert.dom('.course .editinplace').hasText(course.title, 'Course title is visible.');
    const details = find('[data-test-course-details]').textContent.trim();
    assert.ok(details.includes('Level: ' + course.level), 'Level of linked course is visible.');
    assert.ok(
      details.includes('Start Date: ' + moment(course.startDate).utc().format('YYYY-MM-DD')),
      'Start date of linked course is visible.'
    );
    assert.ok(
      details.includes('End Date: ' + moment(course.endDate).utc().format('YYYY-MM-DD')),
      'End date of linked course is visible.'
    );
    assert.ok(
      details.includes('Clerkship (' + clerkshipType.title + ')'),
      'Clerkship-type of linked course is visible.'
    );
    assert.dom('.description label').hasText('Description:', 'Description label is correct.');
    assert.dom('.description .editinplace').hasText(block.description, 'Description is visible.');
    assert.dom('.required label').hasText('Required:', 'Required label is correct.');
    assert.dom('.required .editinplace').hasText('Optional (elective)', 'Required is visible.');
    assert.dom('.track label').hasText('Is Track:', 'Track label is correct.');
    assert.dom('.track input').isChecked('Track toggle is set to "yes"');
    assert.dom('.start-date label').hasText('Start:', 'Start date label is correct.');
    assert.dom('.start-date .editinplace').hasText(moment(block.startDate).format('L'), 'Start date is visible.');
    assert.dom('.end-date label').hasText('End:', 'End date label is correct.');
    assert.dom('.end-date .editinplace').hasText(moment(block.endDate).format('L'), 'End date is visible.');
    assert.dom('.duration label').hasText('Duration (in Days):', 'Duration label is correct.');
    assert.dom('.duration .editinplace').hasText(block.duration, 'Duration is visible.');
    assert.dom('.child-sequence-order label').hasText('Child Sequence Order:', 'Child sequence order label is correct.');
    assert.dom('.child-sequence-order .editinplace').hasText('Ordered', 'Child sequence order is visible.');
    assert.dom('.order-in-sequence label').hasText('Order in Sequence:', 'Order in sequence label is visible.');
    assert.dom('.order-in-sequence .editinplace').hasText(block.orderInSequence, 'Order in sequence is visible.');
    assert.dom('.selective label').hasText('Is Selective?', 'Is Selective label correct.');
    assert.dom('.minimum label').hasText('Minimum:', 'Minimum label is correct.');
    assert.dom('.minimum .editinplace').hasText(block.minimum, 'Minimum is visible.');
    assert.dom('.maximum label').hasText('Maximum:', 'Maximum label is correct.');
    assert.dom('.maximum .editinplace').hasText(block.maximum, 'Maximum is visible.');
    assert.dom('.academic-level label').hasText('Academic Level:', 'Academic level label is correct.');
    assert.dom('.academic-level .editinplace').hasText(academicLevel.name, 'Academic level is visible.');
    assert.dom('.sessions label').hasText('Sessions (3)', 'List is labeled with number of linkable sessions');
    assert.dom('.sessions .actions button').hasText('Manage', 'Manage button for sessions is visible.');
    // we're just going to peak at the list items here,
    // any other tests are performed in the respective integration test for the list component.
    assert.dom('.curriculum-inventory-sequence-block-session-list tbody tr').exists({ count: 3 }, 'All linkable sessions are visible');
    assert.ok(
      find(
        findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(1) td')[2]
      ).textContent.trim().startsWith('(ILM)'),
      'ILM is labeled as such.'
    );

    assert.ok(
      find(
        findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(1) td')[2]
      ).textContent.trim().endsWith('Session A'),
      'Sessions are sorted by title.'
    );

    assert.dom(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(2) td')[2]
    ).hasText('Session B', 'Sessions are sorted by title.');
    assert.dom(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(3) td')[2]
    ).hasText('Session C', 'Sessions are sorted by title.');

  });

  test('order in sequence is n/a for top level block', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      id: 2,
      description: 'lorem ipsum',
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 2));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
        report=report
        sequenceBlock=sequenceBlock
        canUpdate=true
        sortBy=sortBy
        setSortBy=setSortBy}}
    `);
    assert.dom('.order-in-sequence > span').hasText('n/a');
  });

  test('order in sequence is n/a for nested sequence block in non-ordered sequence ', async function(assert) {
    assert.expect(1);

    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 0,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      id: 2,
      description: 'lorem ipsum',
      report,
      parent: parentBlock,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 2));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);

    assert.dom('.order-in-sequence > span').hasText('n/a');
  });


  test('change course', async function(assert) {
    assert.expect(11);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');
    const clerkshipType = this.server.create('course-clerkship-type');

    const course = this.server.create('course', {
      school,
      clerkshipType,
      published: true,
      year: '2016',
    });

    this.server.create('course', {
      school,
      clerkshipType,
      published: true,
      year: '2016',
    });

    const newCourse = this.server.create('course', {
      school,
      clerkshipType,
      published: true,
      year: '2016',
    });

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      course,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 1));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);

    await click('.course .editinplace .clickable');
    assert.dom('.course option').exists({ count: 4 }, 'Linkable courses dropdown contains four options.');
    assert.dom('.course option').hasText('Select a Course', 'First option is placeholder');
    assert.dom(findAll('.course option')[1]).hasText('course 0', 'Options are sorted by course title');
    assert.dom(findAll('.course option')[2]).hasText('course 1', 'Options are sorted by course title');
    assert.dom(findAll('.course option')[3]).hasText('course 2', 'Options are sorted by course title');
    assert.dom('.course option:checked').hasText(course.title, 'The linked course is selected.');
    await fillIn('.course select', newCourse.id);
    const details = find('[data-test-course-details]').textContent.trim();
    assert.ok(details.indexOf('Level: ' + newCourse.level) === 0,
      'Linked course details: level has been updated.'
    );
    assert.ok(
      details.indexOf('Start Date: ' + moment(newCourse.startDate).format('YYYY-MM-DD')) > 0,
      'Linked course details: start date has been updated.'
    );
    assert.ok(
      details.indexOf('End Date: ' + moment(newCourse.endDate).format('YYYY-MM-DD')) > 0,
      'Linked course details: end date has been updated.'
    );
    assert.ok(
      details.indexOf('Clerkship (' + clerkshipType.title + ')') > 0,
      'Linked course details: clerkship title has been updated.'
    );
    await click('.course .actions .done');
    assert.dom('.course .editinplace').hasText(newCourse.title, 'Course title has been updated.');
  });

  test('change description', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 1));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);

    assert.dom('.description .editinplace').hasText('Click to add a description.');
    await click('.description .editinplace .clickable');
    const newDescription = 'Lorem Ipsum';
    await fillIn('.description textarea', newDescription);
    await click('.description .actions .done');
    assert.dom('.description .editinplace').hasText(newDescription);
    assert.equal(sequenceBlockModel.get('description'), newDescription);
  });

  test('change required', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 1));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);

    assert.dom('.required .editinplace').hasText('Optional (elective)');
    await click('.required .editinplace .clickable');
    const newVal = 1;
    await fillIn('.required select', newVal);
    await click('.required .actions .done');
    assert.dom('.required .editinplace').hasText('Required');
    assert.equal(sequenceBlockModel.get('required'), newVal);
  });

  test('change track', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 1));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);

    assert.dom('.track input').isChecked('Track toggle is initially set to "yes"');
    await click('.track .switch-label');
    assert.dom('.track input').isNotChecked('Track toggle is now set to "no"');
  });

  test('change child sequence order', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 1));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);
    assert.dom('.child-sequence-order .editinplace').hasText('Ordered');
    await click('.child-sequence-order .editinplace .clickable');
    const newVal = 2;
    await fillIn('.child-sequence-order select', newVal);
    await click('.child-sequence-order .actions .done');
    assert.dom('.child-sequence-order .editinplace').hasText('Unordered');
    assert.equal(sequenceBlockModel.get('childSequenceOrder'), newVal);
  });

  test('change order in sequence', async function(assert) {
    assert.expect(7);

    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevel = this.server.create('curriculum-inventory-academic-level');

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels: [academicLevel],
      year: '2016',
      program,
      isFinalized: false,
    });

    const parent = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });

    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report,
      parent,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel
    });

    this.server.create('curriculum-inventory-sequence-block', {
      orderInSequence: 2,
      report,
      parent,
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', report.id));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', block.id));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);
    assert.dom('.order-in-sequence .editinplace').hasText(sequenceBlockModel.get('orderInSequence'));
    await click('.order-in-sequence .editinplace .clickable');
    assert.dom('.order-in-sequence option').exists({ count: 2 }, 'There should be two options');
    assert.dom('.order-in-sequence option').hasValue('1', 'First option has the correct value.');
    assert.dom(findAll('.order-in-sequence option')[1]).hasValue('2', 'Second option has the correct value.');
    assert.dom('.order-in-sequence option:checked').hasValue(sequenceBlockModel.get('orderInSequence'), 'Correct option is selected.');
    const newVal = 2;
    await fillIn('.order-in-sequence select', newVal);
    await click('.order-in-sequence .actions .done');
    assert.dom('.order-in-sequence .editinplace').hasText(newVal);
    assert.equal(sequenceBlockModel.get('orderInSequence'), newVal);
  });

  test('change academic level', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school
    });
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      report,
      duration: 0,
      childSequenceOrder: 1,
      orderInSequence: 0,
      required: 2,
      track: true,
      minimum: 0,
      maximum: 0,
      academicLevel: academicLevels[0],
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 1));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', null);
    this.set('setSortBy', null);
    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);

    assert.dom('.academic-level .editinplace').hasText(academicLevels[0].name);
    await click('.academic-level .editinplace .clickable');
    const newVal = 9;
    await fillIn('.academic-level select', newVal);
    await click('.academic-level .actions .done');
    assert.dom('.academic-level .editinplace').hasText(`Year ${newVal - 1}`);
  });

  test('manage sessions', async function(assert) {
    assert.expect(5);

    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school
    });
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });

    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4
    });

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false
    });

    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });

    const ilmSessionType = this.server.create('session-type', { title: 'Independent Learning' });
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course,
      sessionType: ilmSessionType,
      ilmSession,
      published: true,
    });

    const lectureSessionType = this.server.create('session-type', { title: 'Lecture' });
    this.server.create('session', {
      course,
      sessionType: lectureSessionType,
      published: true,
    });

    this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: academicLevels[0]
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 2));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=true sortBy=sortBy setSortBy=setSortBy}}`);
    assert.dom('.curriculum-inventory-sequence-block-session-manager').doesNotExist('Sessions-manager is initially not visible.');
    assert.dom('.sessions').exists({ count: 1 }, 'Sessions-list is initially visible.');

    await click('.sessions .actions button');
    assert.dom('.curriculum-inventory-sequence-block-session-manager').exists({ count: 1 }, 'Sessions-manager is visible.');
    assert.dom('.sessions').doesNotExist('Sessions-list is not visible.');
    assert.dom('.sessions .actions button').doesNotExist('Manage button is not visible.');
  });

  test('read-only mode', async function(assert) {
    assert.expect(22);

    const school = this.server.create('school');
    const academicLevels = this.server.createList('curriculum-inventory-academic-level', 10);
    const program = this.server.create('program', {
      school
    });
    const clerkshipType = this.server.create('course-clerkship-type', { title: 'Block' });

    const course = this.server.create('course', {
      title: 'Course A',
      startDate: new Date('2015-02-02'),
      endDate: new Date('2015-03-30'),
      clerkshipType,
      level: 4
    });

    const report = this.server.create('curriculum-inventory-report', {
      academicLevels,
      year: '2016',
      program,
      isFinalized: false
    });

    const parentBlock = this.server.create('curriculum-inventory-sequence-block', {
      childSequenceOrder: 1,
    });

    const academicLevel = academicLevels[0];

    const ilmSessionType = this.server.create('session-type', { title: 'Independent Learning' });
    const ilmSession = this.server.create('ilm-session');
    this.server.create('session', {
      course,
      title: 'Session A',
      sessionType: ilmSessionType,
      ilmSession,
      published: true,
    });

    const presentationSessionType = this.server.create('session-type', { title: 'Presentation' });
    this.server.create('session', {
      course,
      title: 'Session B',
      sessionType: presentationSessionType,
      published: true,
    });

    const lectureSessionType = this.server.create('session-type', { title: 'Lecture' });
    this.server.create('session', {
      course,
      title: 'Session C',
      sessionType: lectureSessionType,
      published: true,
    });

    const block = this.server.create('curriculum-inventory-sequence-block', {
      description: 'lorem ipsum',
      report,
      parent: parentBlock,
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course,
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel
    });

    const reportModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const sequenceBlockModel = await run(() => this.owner.lookup('service:store').find('curriculum-inventory-sequence-block', 2));

    this.set('report', reportModel);
    this.set('sequenceBlock', sequenceBlockModel);
    this.set('sortBy', 'title');
    this.set('setSortBy', null);

    await render(hbs`{{curriculum-inventory-sequence-block-overview
      report=report sequenceBlock=sequenceBlock canUpdate=false sortBy=sortBy setSortBy=setSortBy}}`);

    assert.dom('.description > span').hasText(block.description, 'Block description is visible.');
    assert.dom('[data-test-course-title]').hasText(course.title, 'Course title is visible.');
    const details = find('[data-test-course-details]').textContent.trim();
    assert.ok(details.includes('Level: ' + course.level), 'Level of linked course is visible.');
    assert.ok(
      details.includes('Start Date: ' + moment(course.startDate).utc().format('YYYY-MM-DD')),
      'Start date of linked course is visible.'
    );
    assert.ok(
      details.indexOf('End Date: ' + moment(course.endDate).utc().format('YYYY-MM-DD')) > 0,
      'End date of linked course is visible.'
    );
    assert.ok(
      details.indexOf('Clerkship (' + clerkshipType.title + ')') > 0,
      'Clerkship-type of linked course is visible.'
    );
    assert.dom('.description > span').hasText(block.description, 'Description is visible.');
    assert.dom('.required > span').hasText('Optional (elective)', 'Required is visible.');
    assert.ok(find('.track > span').textContent.trim(), 'Is Track is visible.');
    assert.dom('.start-date > span').hasText(moment(block.startDate).format('L'), 'Start date is visible.');
    assert.dom('.end-date > span').hasText(moment(block.endDate).format('L'), 'End date is visible.');
    assert.dom('.duration > span').hasText(block.duration, 'Duration is visible.');
    assert.dom('.child-sequence-order > span').hasText('Ordered', 'Child sequence order is visible.');
    assert.dom('.order-in-sequence > span').hasText(block.orderInSequence, 'Order in sequence is visible.');
    assert.dom('.minimum > span').hasText(block.minimum, 'Minimum is visible.');
    assert.dom('.maximum > span').hasText(block.maximum, 'Maximum is visible.');
    assert.dom('.academic-level > span').hasText(academicLevel.name, 'Academic level is visible.');
    assert.notOk(findAll('.sessions .actions button').length, 'Manage button for sessions is visible.');
    assert.dom('.curriculum-inventory-sequence-block-session-list tbody tr').exists({ count: 3 }, 'All linkable sessions are visible');
    assert.ok(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(1) td')[2].textContent.trim().endsWith('Session A'),
      'Sessions are sorted by title.'
    );
    assert.dom(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(2) td')[2]
    ).hasText('Session B', 'Sessions are sorted by title.');
    assert.dom(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(3) td')[2]
    ).hasText('Session C', 'Sessions are sorted by title.');
  });
});
