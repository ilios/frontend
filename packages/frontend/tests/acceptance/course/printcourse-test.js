import { find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';
import { DateTime } from 'luxon';

module('Acceptance | Course - Print Course', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ school: this.school }, true);
    const program = await this.server.create('program', { school: this.school });
    const programYear = await this.server.create('program-year', { program });
    await this.server.create('academic-year');
    const cohort = await this.server.create('cohort', { programYear });
    const userRole = (this.learningMaterialUserRole = await this.server.create(
      'learning-material-user-role',
    ));
    const status = (this.learningMaterialStatus = await this.server.create(
      'learning-material-status',
    ));
    this.course = await this.server.create('course', {
      year: 2013,
      school: this.school,
      published: true,
      title: 'Back to the Future',
      cohorts: [cohort],
    });
    const vocabulary = await this.server.create('vocabulary', {
      title: 'Topics',
      school: this.school,
    });
    await this.server.create('term', {
      title: 'Time Travel',
      courses: [this.course],
      vocabulary,
    });
    this.user = await this.server.create('user', {
      lastName: 'Brown',
      firstName: 'Emmet',
      id: 1,
    });
    const learningMaterial = await this.server.create('learning-material', {
      title: 'Save the Clock Tower',
      originalAuthor: 'Jennifer Johnson',
      filename: 'Clock Tower Flyer',
      owningUser: this.user,
      status,
      userRole,
      copyrightPermission: true,
      citation: 'Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955',
      description:
        'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.',
    });
    await this.server.create('courseLearningMaterial', {
      learningMaterial,
      course: this.course,
      required: false,
    });
    await this.server.create('mesh-descriptor', {
      courses: [this.course],
      name: 'Flux Capacitor',
    });
  });

  test('print course header', async function (assert) {
    await visit('/course/1/print');
    await takeScreenshot(assert);
    assert.dom('[data-test-course-header] [data-test-course-title]').hasText('Back to the Future');
    assert.dom('[data-test-course-header] [data-test-course-year]').hasText('2013');
  });

  test('course year shows as range if applicable by configuration', async function (assert) {
    const { apiVersion } = this.owner.resolveRegistration('config:environment');
    this.server.get('/application/config', function () {
      assert.step('API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
          apiVersion,
        },
      };
    });
    await visit('/course/1/print');
    assert.dom('[data-test-course-header] [data-test-course-year]').hasText('2013 - 2014');
    assert.verifySteps(['API called']);
  });

  test('print course mesh terms', async function (assert) {
    await visit('/course/1/print');
    assert.dom('[data-test-course-mesh] ul li').hasText('Flux Capacitor');
  });

  test('print course learning materials', async function (assert) {
    await visit('/course/1/print');

    const values = await findAll('[data-test-course-learningmaterials] .content tbody tr td');
    assert.dom(values[0]).hasText('Save the Clock Tower');
    assert.dom(values[1]).hasText('file');
    assert.dom(values[2]).hasText('No');
    assert
      .dom(values[4])
      .hasText(
        'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines. Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955',
      );
  });

  test('test print unpublished sessions for elevated privileges', async function (assert) {
    await this.server.create('session', {
      course: this.course,
      published: false,
      publishedAsTbd: false,
    });
    await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });
    await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: true,
    });
    await visit('/course/1/print?unpublished=true');

    const sessionHeaders = await findAll('[data-test-session-header] h2');
    assert.strictEqual(sessionHeaders.length, 3);
    assert.dom(sessionHeaders[0]).hasText('session 0');
    assert.dom(sessionHeaders[1]).hasText('session 1');
    assert.dom(sessionHeaders[2]).hasText('session 2');
  });

  test('test print ILM details', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });

    await this.server.create('ilm-session', {
      session,
      hours: 1.5,
      dueDate: DateTime.fromObject({
        year: 1995,
        month: 12,
        day: 17,
        hour: 3,
        minute: 24,
        second: 0,
      }).toISO(),
    });

    await visit('/course/1/print');

    const ilmSection = await findAll('[data-test-session-ilm-section]');
    const title = await find('[data-test-session-ilm-section] .title');
    const labels = await findAll('[data-test-session-ilm-section] th');
    const values = await findAll('[data-test-session-ilm-section] td');

    assert.strictEqual(ilmSection.length, 1);
    assert.dom(title).hasText('Independent Learning');
    assert.dom(labels[0]).hasText('Hours');
    assert.dom(labels[1]).hasText('Due By');
    assert.dom(values[0]).hasText('1.5');
    assert.dom(values[1]).hasText('12/17/1995');
  });

  test('test print session objectives', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });
    const courseObjective = await this.server.create('course-objective', {
      course: this.course,
      title: 'Course Objective 1',
    });
    const vocabulary = await this.server.create('vocabulary', {
      school: this.school,
    });
    const term = await this.server.create('term', { vocabulary, active: true });
    const sessionObjective = await this.server.create('session-objective', {
      session,
      title: 'Session Objective 1',
      courseObjectives: [courseObjective],
      terms: [term],
    });

    await this.server.create('mesh-descriptor', {
      sessionObjectives: [sessionObjective],
      name: 'MeSH Descriptor 1',
    });

    await this.server.create('mesh-descriptor', {
      sessionObjectives: [sessionObjective],
      name: 'MeSH Descriptor 2',
    });

    await visit('/course/1/print');

    const labels = await findAll('[data-test-session-objectives] [data-test-header]');
    const values = await findAll(
      '[data-test-session-objectives] [data-test-session-objective-list-item] .grid-item',
    );
    assert.dom(labels[0]).hasText('Description');
    assert.dom(labels[1]).hasText('Parent Objectives');
    assert.dom(labels[2]).hasText('Vocabulary Terms');
    assert.dom(labels[3]).hasText('MeSH Terms');
    assert.dom(values[0]).hasText('Session Objective 1');
    assert.dom(values[1]).hasText('Course Objective 1');
    assert.dom(values[2]).hasText('Vocabulary 2 (school 0) term 1');
    assert.ok(values[3].textContent.trim().startsWith('MeSH Descriptor 1'));
    assert.ok(values[3].textContent.trim().endsWith('MeSH Descriptor 2'));
  });

  test('test print course objectives', async function (assert) {
    const competency = await this.server.create('competency', {
      school: this.school,
      title: 'Competency 1',
    });
    const programYearObjective = await this.server.create('program-year-objective', {
      competency,
      title: 'Program Year Objective 1',
    });
    const vocabulary = await this.server.create('vocabulary', {
      school: this.school,
    });
    const term = await this.server.create('term', { vocabulary, active: true });
    const courseObjective = await this.server.create('course-objective', {
      course: this.course,
      title: 'Course Objective 1',
      programYearObjectives: [programYearObjective],
      terms: [term],
    });

    await this.server.create('mesh-descriptor', {
      courseObjectives: [courseObjective],
      name: 'MeSH Descriptor 1',
    });

    await this.server.create('mesh-descriptor', {
      courseObjectives: [courseObjective],
      name: 'MeSH Descriptor 2',
    });

    await visit('/course/1/print');

    const labels = await findAll('[data-test-course-objectives] [data-test-header]');
    const values = await findAll(
      '[data-test-course-objectives] [data-test-course-objective-list-item] .grid-item',
    );
    assert.dom(labels[0]).hasText('Description');
    assert.dom(labels[1]).hasText('Parent Objectives');
    assert.dom(labels[2]).hasText('Vocabulary Terms');
    assert.dom(labels[3]).hasText('MeSH Terms');
    assert.dom(values[0]).hasText('Course Objective 1');
    assert.dom(values[1]).hasText('Program Year Objective 1');
    assert.dom(values[2]).hasText('Vocabulary 2 (school 0) term 1');
    assert.ok(values[3].textContent.trim().startsWith('MeSH Descriptor 1'));
    assert.ok(values[3].textContent.trim().endsWith('MeSH Descriptor 2'));
  });

  test('test print session learning materials', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });
    const learningMaterial = await this.server.create('learning-material', {
      title: 'Foo',
      originalAuthor: 'Bar',
      owningUser: this.user,
      status: this.learningMaterialStatus,
      userRole: this.learningMaterialUserRole,
      copyrightPermission: true,
      citation: 'lorem ipsum',
    });
    await this.server.create('session-learning-material', {
      learningMaterial,
      session,
      required: false,
    });

    await visit('/course/1/print');
    const lms = await findAll('[data-test-session-learning-materials] tbody tr');
    assert.strictEqual(lms.length, 1);
    assert.dom(lms[0]).hasText('Foo citation No 1 lm description lorem ipsum');
  });

  test('test print session vocabulary terms', async function (assert) {
    const session = await this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });
    const vocabulary1 = await this.server.create('vocabulary', { school: this.school });
    const vocabulary2 = await this.server.create('vocabulary', { school: this.school });
    await this.server.createList('term', 3, {
      vocabulary: vocabulary1,
      sessions: [session],
      active: true,
    });
    await this.server.createList('term', 2, {
      vocabulary: vocabulary2,
      sessions: [session],
      active: true,
    });

    await visit('/course/1/print');
    const sessionTerms = await find('[data-test-session-terms]');
    assert
      .dom(sessionTerms)
      .hasText(
        'Terms (5) Vocabulary 2 (school 0) term 1 term 2 term 3 Vocabulary 3 (school 0) term 4 term 5',
      );
  });
});
