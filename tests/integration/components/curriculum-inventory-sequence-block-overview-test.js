import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll, fillIn } from '@ember/test-helpers';
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
    assert.equal(find('.description label').textContent.trim(), 'Description:', 'Description label is correct.');
    assert.equal(
      find('.description .editinplace').textContent.trim(), block.description,
      'Block description is visible.'
    );
    assert.equal(find('.course label').textContent.trim(), 'Course:', 'Course label is correct.');
    assert.equal(find('.course .editinplace').textContent.trim(), course.title, 'Course title is visible.');
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
    assert.equal(find('.description label').textContent.trim(), 'Description:', 'Description label is correct.');
    assert.equal(find('.description .editinplace').textContent.trim(), block.description, 'Description is visible.');
    assert.equal(find('.required label').textContent.trim(), 'Required:', 'Required label is correct.');
    assert.equal(find('.required .editinplace').textContent.trim(), 'Optional (elective)', 'Required is visible.');
    assert.equal(find('.track label').textContent.trim(), 'Is Track:', 'Track label is correct.');
    assert.ok(find('.track input').checked, 'Track toggle is set to "yes"');
    assert.equal(find('.start-date label').textContent.trim(), 'Start:', 'Start date label is correct.');
    assert.equal(
      find('.start-date .editinplace').textContent.trim(), moment(block.startDate).format('L'),
      'Start date is visible.'
    );
    assert.equal(find('.end-date label').textContent.trim(), 'End:', 'End date label is correct.');
    assert.equal(
      find('.end-date .editinplace').textContent.trim(), moment(block.endDate).format('L'),
      'End date is visible.'
    );
    assert.equal(find('.duration label').textContent.trim(), 'Duration (in Days):', 'Duration label is correct.');
    assert.equal(find('.duration .editinplace').textContent.trim(), block.duration, 'Duration is visible.');
    assert.equal(
      find('.child-sequence-order label').textContent.trim(), 'Child Sequence Order:',
      'Child sequence order label is correct.'
    );
    assert.equal(
      find('.child-sequence-order .editinplace').textContent.trim(), 'Ordered',
      'Child sequence order is visible.'
    );
    assert.equal(
      find('.order-in-sequence label').textContent.trim(), 'Order in Sequence:',
      'Order in sequence label is visible.'
    );
    assert.equal(
      find('.order-in-sequence .editinplace').textContent.trim(), block.orderInSequence, 'Order in sequence is visible.'
    );
    assert.equal(find('.selective label').textContent.trim(), 'Is Selective?', 'Is Selective label correct.');
    assert.equal(find('.minimum label').textContent.trim(), 'Minimum:', 'Minimum label is correct.');
    assert.equal(find('.minimum .editinplace').textContent.trim(), block.minimum, 'Minimum is visible.');
    assert.equal(find('.maximum label').textContent.trim(), 'Maximum:', 'Maximum label is correct.');
    assert.equal(find('.maximum .editinplace').textContent.trim(), block.maximum, 'Maximum is visible.');
    assert.equal(find('.academic-level label').textContent.trim(), 'Academic Level:', 'Academic level label is correct.');
    assert.equal(find('.academic-level .editinplace').textContent.trim(), academicLevel.name, 'Academic level is visible.');
    assert.equal(find('.sessions label').textContent.trim(), 'Sessions (3)', 'List is labeled with number of linkable sessions');
    assert.equal(find('.sessions .actions button').textContent.trim(), 'Manage', 'Manage button for sessions is visible.');
    // we're just going to peak at the list items here,
    // any other tests are performed in the respective integration test for the list component.
    assert.equal(findAll('.curriculum-inventory-sequence-block-session-list tbody tr').length, 3,
      'All linkable sessions are visible'
    );
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

    assert.equal(
      find(
        findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(2) td')[2]
      ).textContent.trim(), 'Session B',
      'Sessions are sorted by title.'
    );
    assert.equal(
      find(
        findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(3) td')[2]
      ).textContent.trim(), 'Session C',
      'Sessions are sorted by title.'
    );

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
    assert.equal(find('.order-in-sequence > span').textContent.trim(), 'n/a');
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

    assert.equal(find('.order-in-sequence > span').textContent.trim(), 'n/a');
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
    assert.equal(findAll('.course option').length, 4, 'Linkable courses dropdown contains four options.');
    assert.equal(find('.course option').textContent.trim(), 'Select a Course', 'First option is placeholder');
    assert.equal(findAll('.course option')[1].textContent.trim(), 'course 0', 'Options are sorted by course title');
    assert.equal(findAll('.course option')[2].textContent.trim(), 'course 1', 'Options are sorted by course title');
    assert.equal(findAll('.course option')[3].textContent.trim(), 'course 2', 'Options are sorted by course title');
    assert.equal(
      find('.course option:checked').textContent.trim(),
      course.title,
      'The linked course is selected.'
    );
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
    assert.equal(find('.course .editinplace').textContent.trim(), newCourse.title, 'Course title has been updated.');
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

    assert.equal(find('.description .editinplace').textContent.trim(), 'Click to add a description.');
    await click('.description .editinplace .clickable');
    const newDescription = 'Lorem Ipsum';
    await fillIn('.description textarea', newDescription);
    await click('.description .actions .done');
    assert.equal(find('.description .editinplace').textContent.trim(), newDescription);
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

    assert.equal(find('.required .editinplace').textContent.trim(), 'Optional (elective)');
    await click('.required .editinplace .clickable');
    const newVal = 1;
    await fillIn('.required select', newVal);
    await click('.required .actions .done');
    assert.equal(find('.required .editinplace').textContent.trim(), 'Required');
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

    assert.ok(find('.track input').checked, 'Track toggle is initially set to "yes"');
    await click('.track .switch-label');
    assert.notOk(find('.track input').checked, 'Track toggle is now set to "no"');
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
    assert.equal(find('.child-sequence-order .editinplace').textContent.trim(), 'Ordered');
    await click('.child-sequence-order .editinplace .clickable');
    const newVal = 2;
    await fillIn('.child-sequence-order select', newVal);
    await click('.child-sequence-order .actions .done');
    assert.equal(find('.child-sequence-order .editinplace').textContent.trim(), 'Unordered');
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
    assert.equal(find('.order-in-sequence .editinplace').textContent.trim(), sequenceBlockModel.get('orderInSequence'));
    await click('.order-in-sequence .editinplace .clickable');
    assert.equal(findAll('.order-in-sequence option').length, 2, 'There should be two options');
    assert.equal(find('.order-in-sequence option').value, '1', 'First option has the correct value.');
    assert.equal(find(findAll('.order-in-sequence option')[1]).value, '2', 'Second option has the correct value.');
    assert.equal(find('.order-in-sequence option:checked').value, sequenceBlockModel.get('orderInSequence'),
      'Correct option is selected.');
    const newVal = 2;
    await fillIn('.order-in-sequence select', newVal);
    await click('.order-in-sequence .actions .done');
    assert.equal(find('.order-in-sequence .editinplace').textContent.trim(), newVal);
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

    assert.equal(find('.academic-level .editinplace').textContent.trim(), academicLevels[0].name);
    await click('.academic-level .editinplace .clickable');
    const newVal = 9;
    await fillIn('.academic-level select', newVal);
    await click('.academic-level .actions .done');
    assert.equal(find('.academic-level .editinplace').textContent.trim(), `Year ${newVal - 1}`);
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
    assert.equal(findAll('.curriculum-inventory-sequence-block-session-manager').length, 0,
      'Sessions-manager is initially not visible.'
    );
    assert.equal(findAll('.sessions').length, 1, 'Sessions-list is initially visible.');

    await click('.sessions .actions button');
    assert.equal(findAll('.curriculum-inventory-sequence-block-session-manager').length, 1,
      'Sessions-manager is visible.'
    );
    assert.equal(findAll('.sessions').length, 0, 'Sessions-list is not visible.');
    assert.equal(findAll('.sessions .actions button').length, 0, 'Manage button is not visible.');
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

    assert.equal(
      find('.description > span').textContent.trim(), block.description,
      'Block description is visible.'
    );
    assert.equal(find('[data-test-course-title]').textContent.trim(), course.title, 'Course title is visible.');
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
    assert.equal(find('.description > span').textContent.trim(), block.description, 'Description is visible.');
    assert.equal(find('.required > span').textContent.trim(), 'Optional (elective)', 'Required is visible.');
    assert.ok(find('.track > span').textContent.trim(), 'Is Track is visible.');
    assert.equal(
      find('.start-date > span').textContent.trim(), moment(block.startDate).format('L'),
      'Start date is visible.'
    );
    assert.equal(
      find('.end-date > span').textContent.trim(), moment(block.endDate).format('L'),
      'End date is visible.'
    );
    assert.equal(find('.duration > span').textContent.trim(), block.duration, 'Duration is visible.');
    assert.equal(find('.child-sequence-order > span').textContent.trim(), 'Ordered', 'Child sequence order is visible.');
    assert.equal(find('.order-in-sequence > span').textContent.trim(), block.orderInSequence, 'Order in sequence is visible.');
    assert.equal(find('.minimum > span').textContent.trim(), block.minimum, 'Minimum is visible.');
    assert.equal(find('.maximum > span').textContent.trim(), block.maximum, 'Maximum is visible.');
    assert.equal(find('.academic-level > span').textContent.trim(), academicLevel.name, 'Academic level is visible.');
    assert.notOk(findAll('.sessions .actions button').length, 'Manage button for sessions is visible.');
    assert.equal(findAll('.curriculum-inventory-sequence-block-session-list tbody tr').length, 3,
      'All linkable sessions are visible'
    );
    assert.ok(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(1) td')[2].textContent.trim().endsWith('Session A'),
      'Sessions are sorted by title.'
    );
    assert.equal(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(2) td')[2].textContent.trim(), 'Session B',
      'Sessions are sorted by title.'
    );
    assert.equal(
      findAll('.curriculum-inventory-sequence-block-session-list tbody tr:nth-of-type(3) td')[2].textContent.trim(), 'Session C',
      'Sessions are sorted by title.'
    );
  });
});
