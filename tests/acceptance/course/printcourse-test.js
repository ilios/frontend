import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;

module('Acceptance: Course - Print Course', {

  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
    server.create('academicYear');
    server.create('course', {
      year: 2013,
      school: 1,
      published: true,
      title: 'Back to the Future',
      cohorts: [1],
      terms: [1],
      objectives: [1],
      learningMaterials: [1],
      meshDescriptors: [1]
    });
    server.create('vocabulary', {
      title: 'Topics',
      terms: [1],
      school: 1,
    });
    server.create('term', {
      title: 'Time Travel',
      sessions: [1],
      vocabulary: 1,
    });
    server.create('objective', {
      sessions: [1],
      school: 1,
      courses: [1],
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
      owningUser: 1,
      status: 1,
      userRole: 1,
      copyrightPermission: true,
      courseLearningMaterials: [1],
      citation: 'Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955',
      description: 'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.'
    });
    server.create('courseLearningMaterial',{
      learningMaterial: 1,
      course: 1,
      required: false,
      meshDescriptors: [1]
    });
    server.create('meshDescriptor', {
      courses: [1],
      name: "Flux Capacitor"
    });

  },

  afterEach: function() {
    destroyApp(application);
  }


});

test('test print course learning materials', async function(assert) {
  await visit('/course/1/print');

  assert.equal(find('.detail-header h2:eq(0)').text(), 'Back to the Future');
  assert.equal(find('.detail-content ul li:eq(0)').text().trim(), 'Time Travel');
  assert.equal(find('.detail-content ul li:eq(1)').text(), 'Gigawatt Conversion');
  assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(0)').text().trim(), 'Save the Clock Tower');
  assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(1)').text(), 'file');
  assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(2)').text().trim(), 'No');
  assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(4)').text().trim(), 'The flux capacitor requires 1.21 gigawatts of electrical power to operate, which is roughly equivalent to the power produced by 15 regular jet engines.Lathrop, Emmett, Flux Capacitor, Journal of Time Travel, 5 Nov 1955');
  assert.equal(find('.detail-content ul li:eq(2)').text(), 'Flux Capacitor');
});
