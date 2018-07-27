import { find, findAll, visit } from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance: Course - Print Course', function(hooks) {
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
    this.server.create('objective', {
      schoolId: 1,
      courseIds: [1],
      title: 'Gigawatt Conversion'
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
      objectiveIds: [1],
      name: "Flux Capacitor"
    });
  });

  test('test print course learning materials', async function (assert) {
    await setupAuthentication( { school: this.school });
    await visit('/course/1/print');

    assert.equal(find('.header h2').textContent, 'Back to the Future');
    assert.equal(find('.content ul li').textContent.trim(), 'Time Travel');
    assert.equal(find(findAll('.content ul li')[1]).textContent, 'Gigawatt Conversion');
    assert.equal(find('.block .content tbody tr td').textContent.trim(), 'Save the Clock Tower');
    assert.equal(find(findAll('.block .content tbody tr td')[1]).textContent, 'file');
    assert.equal(find(findAll('.block .content tbody tr td')[2]).textContent.trim(), 'No');
    assert.equal(find(findAll('.block .content tbody tr td')[4]).textContent.trim(), 'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955');
    assert.equal(find(findAll('.content ul li')[2]).textContent, 'Flux Capacitor');
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
    assert.equal(sessionHeaders[0].textContent, 'session 0');
    assert.equal(sessionHeaders[1].textContent, 'session 1');
    assert.equal(sessionHeaders[2].textContent, 'session 2');
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
    assert.equal(sessionHeaders[0].textContent, 'session 1');
    assert.equal(sessionHeaders[1].textContent, 'session 2');
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
    assert.equal(title.textContent.trim(), 'Independent Learning');
    assert.equal(labels[0].textContent.trim(), 'Hours');
    assert.equal(labels[1].textContent.trim(), 'Due By');
    assert.equal(values[0].textContent.trim(), '1.5');
    assert.equal(values[1].textContent.trim(), '12/17/1995');
  });
});
