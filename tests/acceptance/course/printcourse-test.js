import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Course - Print Course', function(hooks) {
  hooks.beforeEach(function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear');
    server.create('cohort');
    server.create('learning-material-user-role');
    server.create('learning-material-status');
    server.create('course', {
      year: 2013,
      schoolId: 1,
      published: true,
      title: 'Back to the Future',
      cohortIds: [1],
    });
    server.create('vocabulary', {
      title: 'Topics',
      schoolId: 1,
    });
    server.create('term', {
      title: 'Time Travel',
      courseIds: [1],
      vocabularyId: 1,
    });
    server.create('objective', {
      schoolId: 1,
      courseIds: [1],
      title: 'Gigawatt Conversion'
    });
    server.create('user', {
      lastName: 'Brown',
      firstName: 'Emmet',
      id: 1
    });
    server.create('learningMaterial',{
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
    server.create('courseLearningMaterial',{
      learningMaterialId: 1,
      courseId: 1,
      required: false,
    });
    server.create('meshDescriptor', {
      courseIds: [1],
      objectiveIds: [1],
      name: "Flux Capacitor"
    });

  });

  hooks.afterEach(function() {
    destroyApp(application);
  });

  test('test print course learning materials', async function (assert) {
    await visit('/course/1/print');

    assert.equal(find('.header h2:eq(0)').text(), 'Back to the Future');
    assert.equal(find('.content ul li:eq(0)').text().trim(), 'Time Travel');
    assert.equal(find('.content ul li:eq(1)').text(), 'Gigawatt Conversion');
    assert.equal(find('.block .content tbody tr td:eq(0)').text().trim(), 'Save the Clock Tower');
    assert.equal(find('.block .content tbody tr td:eq(1)').text(), 'file');
    assert.equal(find('.block .content tbody tr td:eq(2)').text().trim(), 'No');
    assert.equal(find('.block .content tbody tr td:eq(4)').text().trim(), 'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955');
    assert.equal(find('.content ul li:eq(2)').text(), 'Flux Capacitor');
  });
});