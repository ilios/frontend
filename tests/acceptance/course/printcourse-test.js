import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
//import Ember from 'ember';

//const { isEmpty, isPresent, run } = Ember;
//const { later } = run;

var application;
var fixtures = {};

module('Acceptance: Course - Print Course' + testgroup, {

  beforeEach: function() {
    application = startApp();
    fixtures.user = setupAuthentication(application);
    server.create('school');
    server.create('academicYear');
    server.create('course', {
      year: 2013,
      school: 1,
      published: true,
      title: 'Back to the Future',
      cohorts: [1],
      topics: [1],
      objectives: [1],
      learningMaterials: [1],
      meshDescriptors: [1]
    });
    server.create('topic', {
      title: 'Time Travel',
      sessions: [1],
      school: 1,
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

test('test print course', function(assert) {

  visit('/course/1/print');

  andThen(function() {
    assert.equal(find('.detail-header h2:eq(0)').text(), 'Back to the Future');
    assert.equal(find('.detail-content ul li:eq(0)').text(), 'Time Travel');
    assert.equal(find('.detail-content ul li:eq(1)').text(), 'Gigawatt Conversion');
    assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(0)').text().trim(), 'Save the Clock Tower');
    assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(1)').text(), 'file');
    assert.equal(find('.detail-view-details .detail-content tbody tr td:eq(2)').text().trim(), 'No');
    assert.equal(find('.detail-content ul li:eq(2)').text(), 'Flux Capacitor');
  });
});
