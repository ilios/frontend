import Ember from 'ember';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';

var application;
var fixtures = {};
var url = '/course/1?details=true';
module('Acceptance: Course - Learning Materials', {
  beforeEach: function() {
    application = startApp();
    fixtures.user = server.create('user', {id: 4136});
    server.create('school');
    server.create('educationalYear');
    fixtures.statuses = server.createList('learningMaterialStatus', 5);
    fixtures.roles = server.createList('learningMaterialUserRole', 3);
    fixtures.learningMaterials = [];
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      type: 'file'
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Hunter Pence',
      type: 'link'
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Willie Mays',
      type: 'citation'
    }));
    fixtures.courseLearningMaterials = [];
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 1,
      course: 1,
      required: false,
    }));
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 2,
      course: 1,
      publicNotes: false,
    }));
    fixtures.courseLearningMaterials.pushObject(server.create('courseLearningMaterial',{
      learningMaterial: 3,
      course: 1,
    }));

    fixtures.course = server.create('course', {
      year: 2013,
      owningSchool: 1,
      learningMaterials: [1, 2, 3],
    });
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('list learning materials', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    for (let i = 0; i < fixtures.course.learningMaterials.length; i++){
      let row = rows.eq(i);
      let courseLm = fixtures.courseLearningMaterials[fixtures.course.learningMaterials[i] - 1];
      let lm = fixtures.learningMaterials[courseLm.learningMaterial - 1];
      assert.equal(getElementText(find('td:eq(0)', row)), getText(lm.title));
      assert.equal(getElementText(find('td:eq(1)', row)), getText(lm.type));
      assert.equal(getElementText(find('td:eq(2)', row)), getText(lm.originalAuthor));
      let required = courseLm.required?'Yes':'No';
      assert.equal(getElementText(find('td:eq(3)', row)), getText(required));
      let publicNotes = courseLm.publicNotes?'Yes':'No';
      assert.equal(getElementText(find('td:eq(4)', row)), getText(publicNotes));
    }
  });
});

test('create new file learning material', function(assert) {
  visit(url);
  var testTitle = 'testsome title';
  var testAuthor = 'testsome author';
  var testDescription = 'testsome description';
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container);
    //pick the file type
    click('.detail-actions ul li:eq(0)');
  });
  andThen(function(){
    //check that we got the right form
    let labels = find('.detail-learning-materials .newlearningmaterial label');
    assert.equal(labels.length, 8);
    let userName = fixtures.user.firstName + fixtures.user.lastName;
    assert.equal(getElementText(find('.detail-learning-materials .newlearningmaterial .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .newlearningmaterial');
    let inputs = find('input', newLmContainer);
    let textAreas = find('textarea', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(textAreas.eq(0), testDescription);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    click('.detail-learning-materials .newlearningmaterial .done');
  });
  andThen(function(){
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length + 1);
    let row = rows.eq(fixtures.course.learningMaterials.length);
    assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
    assert.equal(getElementText(find('td:eq(1)', row)), getText('file'));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(testAuthor));

  });

});

test('create new link learning material', function(assert) {
  visit(url);
  var testTitle = 'testsome title';
  var testAuthor = 'testsome author';
  var testDescription = 'testsome description';
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container);
    //pick the citation type
    click('.detail-actions ul li:eq(1)');
  });
  andThen(function(){
    //check that we got the right form
    let labels = find('.detail-learning-materials .newlearningmaterial label');
    assert.equal(labels.length, 7);
    let userName = fixtures.user.firstName + fixtures.user.lastName;
    assert.equal(getElementText(find('.detail-learning-materials .newlearningmaterial .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .newlearningmaterial');
    let inputs = find('input', newLmContainer);
    let textAreas = find('textarea', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(textAreas.eq(0), testDescription);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    click('.detail-learning-materials .newlearningmaterial .done');
  });
  andThen(function(){
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length + 1);
    let row = rows.eq(fixtures.course.learningMaterials.length);
    assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
    assert.equal(getElementText(find('td:eq(1)', row)), getText('link'));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(testAuthor));

  });

});

test('create new citation learning material', function(assert) {
  visit(url);
  var testTitle = 'testsome title';
  var testAuthor = 'testsome author';
  var testDescription = 'testsome description';
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container);
    //pick the citation type
    click('.detail-actions ul li:eq(2)');
  });
  andThen(function(){
    //check that we got the right form
    let labels = find('.detail-learning-materials .newlearningmaterial label');
    assert.equal(labels.length, 7);
    let userName = fixtures.user.firstName + fixtures.user.lastName;
    assert.equal(getElementText(find('.detail-learning-materials .newlearningmaterial .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .newlearningmaterial');
    let inputs = find('input', newLmContainer);
    let textAreas = find('textarea', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(textAreas.eq(0), testDescription);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    click('.detail-learning-materials .newlearningmaterial .done');
  });
  andThen(function(){
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length + 1);
    let row = rows.eq(fixtures.course.learningMaterials.length);
    assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
    assert.equal(getElementText(find('td:eq(1)', row)), getText('citation'));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(testAuthor));

  });

});

test('cancel new learning material', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.course.learningMaterials.length);
    click('.detail-actions .button', container);
    click('.detail-actions ul li:eq(0)');
  });
  andThen(function(){
    click('.detail-learning-materials .newlearningmaterial .cancel');
  });
  andThen(function(){
    let rows = find('.detail-learning-materials .detail-content tbody tr');
    assert.equal(rows.length, fixtures.course.learningMaterials.length);

  });

});
