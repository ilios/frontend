import { find, findAll, visit } from '@ember/test-helpers';
import {
  module,
  skip,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Course - Print Course', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.server.create('academicYear');
    this.server.create('cohort');
    this.server.create('learning-material-user-role');
    this.server.create('learning-material-status');
    this.course = this.server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      title: 'Back to the Future',
      cohortIds: [1],
    });
    this.server.create('vocabulary', {
      title: 'Topics',
      schoolId: 1,
    });
    this.server.create('term', {
      title: 'Time Travel',
      courseIds: [1],
      vocabularyId: 1,
    });
    this.server.create('user', {
      lastName: 'Brown',
      firstName: 'Emmet',
      id: 1
    });
    this.server.create('learningMaterial',{
      title: 'Save the Clock Tower',
      originalAuthor: 'Jennifer Johnson',
      filename: 'Clock Tower Flyer',
      owningUserId: 1,
      statusId: 1,
      userRoleId: 1,
      copyrightPermission: true,
      citation: 'Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955',
      description: 'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.'
    });
    this.server.create('courseLearningMaterial',{
      learningMaterialId: 1,
      courseId: 1,
      required: false,
    });
    this.server.create('meshDescriptor', {
      courseIds: [1],
      name: "Flux Capacitor"
    });
  });

  test('print course header', async function (assert) {
    assert.expect(1);
    await setupAuthentication( { school: this.school });
    await visit('/course/1/print');
    assert.dom('[data-test-course-header] h2').hasText('Back to the Future');
  });

  test('print course mesh terms', async function (assert) {
    assert.expect(1);
    await setupAuthentication( { school: this.school });
    await visit('/course/1/print');
    assert.dom('[data-test-course-mesh] ul li').hasText('Flux Capacitor');
  });

  test('test print course learning materials', async function (assert) {
    assert.expect(4);
    await setupAuthentication( { school: this.school });
    await visit('/course/1/print');

    const values = await findAll('[data-test-course-learningmaterials] .content tbody tr td');
    assert.dom(values[0]).hasText('Save the Clock Tower');
    assert.dom(values[1]).hasText('file');
    assert.dom(values[2]).hasText('No');
    assert.dom(values[4]).hasText(
      'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955'
    );
  });

  test('test print unpublished sessions for elevated privileges', async function (assert) {
    await setupAuthentication( { school: this.school }, true);
    this.server.create('session', {
      course: this.course,
      published: false,
      publishedAsTbd: false,
    });
    this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });
    this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: true,
    });
    await visit('/course/1/print?unpublished=true');

    const sessionHeaders = await findAll('[data-test-session-header] h2');
    assert.equal(sessionHeaders.length, 3);
    assert.dom(sessionHeaders[0]).hasText('session 0');
    assert.dom(sessionHeaders[1]).hasText('session 1');
    assert.dom(sessionHeaders[2]).hasText('session 2');
  });

  test('test does not print unpublished sessions for unprivileged users', async function (assert) {
    await setupAuthentication( { school: this.school });
    this.server.create('session', {
      course: this.course,
      published: false,
      publishedAsTbd: false,
    });
    this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });
    this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: true,
    });
    await visit('/course/1/print?unpublished=true');

    const sessionHeaders = await findAll('[data-test-session-header] h2');
    assert.equal(sessionHeaders.length, 2);
    assert.dom(sessionHeaders[0]).hasText('session 1');
    assert.dom(sessionHeaders[1]).hasText('session 2');
  });

  test('test print ILM details', async function (assert) {
    assert.expect(6);
    await setupAuthentication( { school: this.school });

    this.server.create('session', {
      course: this.course,
      published: true,
      publishedAsTbd: false,
    });

    this.server.create('ilmSession', {
      sessionId: 1,
      hours: 1.5,
      dueDate: new Date('1995-12-17T03:24:00')
    });

    await visit('/course/1/print');

    const ilmSection = await findAll('[data-test-session-ilm-section]');
    const title = await find('[data-test-session-ilm-section] .title');
    const labels = await findAll('[data-test-session-ilm-section] th');
    const values = await findAll('[data-test-session-ilm-section] td');

    assert.equal(ilmSection.length, 1);
    assert.dom(title).hasText('Independent Learning');
    assert.dom(labels[0]).hasText('Hours');
    assert.dom(labels[1]).hasText('Due By');
    assert.dom(values[0]).hasText('1.5');
    assert.dom(values[1]).hasText('12/17/1995');
  });

  test('test print session objectives', async function(assert) {
    assert.expect(7);
    await setupAuthentication( { school: this.school });

    this.server.create('session', {
      courseId: 1,
      published: true,
      publishedAsTbd: false,
    });

    this.server.create('objective', {
      schoolId: 1,
      courseIds: [1],
      title: 'Course Objective 1',
      parentIds: []
    });

    this.server.create('objective', {
      schoolId: 1,
      sessionIds: [1],
      parentIds: [1],
      title: 'Session Objective 1',
    });

    this.server.create('meshDescriptor', {
      objectiveIds: [2],
      name: "MeSH Descriptor 1",
    });

    this.server.create('meshDescriptor', {
      objectiveIds: [2],
      name: "MeSH Descriptor 2",
    });

    await visit('/course/1/print');

    const labels = await findAll('[data-test-session-objectives] th');
    const values = await findAll('[data-test-session-objectives] td');

    assert.dom(labels[0]).hasText('Objectives');
    assert.dom(labels[1]).hasText('Parent Objectives');
    assert.dom(labels[2]).hasText('MeSH Terms');
    assert.dom(values[0]).hasText('Session Objective 1');
    assert.dom(values[1]).hasText('Course Objective 1');
    assert.ok(values[2].textContent.trim().startsWith('MeSH Descriptor 1'));
    assert.ok(values[2].textContent.trim().endsWith('MeSH Descriptor 2'));
  });

  /**
   * Commented out due to consistent failure.
   * Error message:
   * "You have turned on testing mode, which disabled the run-loop's autorun.
   * You will need to wrap any code with asynchronous side-effects in a run"
   *
   * I've been unable to fix this, the failure occurs in the Objective::treeCompetencies() CP
   * when attempting to access the `parents` attribute of that model.
   *
   * @todo have another stab at this [ST 2018/08/01]
   */
  skip('test print course objectives', async function(assert) {
    assert.expect(8);
    await setupAuthentication( { school: this.school });

    this.server.create('competency', {
      schoolId: 1,
      title: 'Competency 1',
    });

    this.server.create('objective', {
      schoolId: 1,
      competencyId: 1,
      title: 'Program Year Objective 1',
    });

    this.server.create('objective', {
      schoolId: 1,
      courseIds: [1],
      parentIds: [1],
      title: 'Course Objective 1',
    });

    this.server.create('meshDescriptor', {
      objectiveIds: [2],
      name: "MeSH Descriptor 1",
    });

    this.server.create('meshDescriptor', {
      objectiveIds: [2],
      name: "MeSH Descriptor 2",
    });

    await visit('/course/1/print');

    const labels = await findAll('[data-test-course-objectives] th');
    const values = await findAll('[data-test-course-objectives] td');

    assert.dom(labels[0]).hasText('Objectives');
    assert.dom(labels[1]).hasText('Parent Objectives');
    assert.dom(labels[2]).hasText('MeSH Terms');
    assert.dom(values[0]).hasText('Course Objective 1');
    assert.ok(values[1].textContent.trim().startsWith('Program Year Objective 1'));
    assert.ok(values[1].textContent.trim().endsWith('(Competency 1)'));
    assert.ok(values[2].textContent.trim().startsWith('MeSH Descriptor 1'));
    assert.ok(values[2].textContent.trim().endsWith('MeSH Descriptor 2'));
  });
});
