import { isPresent, isEmpty } from '@ember/utils';
import { run } from '@ember/runloop';
import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import wait from 'ember-test-helpers/wait';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { later } = run;

var application;
var url = '/courses/1?details=true';
const today = moment();
module('Acceptance: Course - Learning Materials', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('academicYear');
    server.create('learningMaterialStatus', {
      learningMaterialIds: [1]
    });
    server.createList('learningMaterialStatus', 5);
    server.createList('learningMaterialUserRole', 3);
    server.createList('meshDescriptor', 6);
    server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      owningUserId: 4136,
      statusId: 1,
      userRoleId: 1,
      copyrightPermission: true,
      filename: 'something.pdf',
      absoluteFileUri: 'http://somethingsomething.com/something.pdf',
      uploadDate: moment('2015-02-12').toDate(),
    });
    server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      owningUserId: 4136,
      statusId: 1,
      userRoleId: 1,
      copyrightPermission: false,
      copyrightRationale: 'reason is thus',
      filename: 'filename',
      absoluteFileUri: 'http://example.com/file',
      uploadDate: moment('2011-03-14').toDate(),
    });
    server.create('learningMaterial',{
      originalAuthor: 'Hunter Pence',
      link: 'www.example.com',
      statusId: 1,
      owningUserId: 4136,
      userRoleId: 1,
      uploadDate: today.toDate(),
    });
    server.create('learningMaterial',{
      originalAuthor: 'Willie Mays',
      citation: 'a citation',
      statusId: 1,
      userRoleId: 1,
      owningUserId: 4136,
      uploadDate: moment('2016-12-12').toDate(),
    });
    server.create('learningMaterial',{
      title: 'Letter to Doc Brown',
      originalAuthor: 'Marty McFly',
      owningUserId: 4136,
      statusId: 1,
      userRoleId: 1,
      copyrightPermission: true,
      uploadDate: moment('2016-03-03').toDate(),
      filename: 'letter.txt',
      absoluteFileUri: 'http://bttf.com/letter.txt'
    });
    server.create('courseLearningMaterial',{
      learningMaterialId: 1,
      courseId: 1,
      required: false,
      meshDescriptorIds: [2,3],
      position: 0,
    });
    server.create('courseLearningMaterial',{
      learningMaterialId: 2,
      courseId: 1,
      required: false,
      position: 1,
    });
    server.create('courseLearningMaterial',{
      learningMaterialId: 3,
      courseId: 1,
      publicNotes: false,
      position: 2,
    });
    server.create('courseLearningMaterial',{
      learningMaterialId: 4,
      courseId: 1,
      position: 3,
      notes: 'test notes',
    });

    server.create('course', {
      year: 2013,
      schoolId: 1,
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list learning materials', async function (assert) {
  await visit(url);
  assert.equal(currentPath(), 'course.index');
  const courseLearningMaterials = '.detail-learningmaterials .detail-learningmaterials-content tbody tr';
  const title = 'td:eq(0)';
  const owner = 'td:eq(1)';
  const required = 'td:eq(2)';
  const notes = 'td:eq(3)';
  const mesh = 'td:eq(4)';
  const status = 'td:eq(5)';

  const firstTitle = `${courseLearningMaterials}:eq(0) ${title}`;
  const firstOwner = `${courseLearningMaterials}:eq(0) ${owner}`;
  const firstRequired = `${courseLearningMaterials}:eq(0) ${required}`;
  const firstNotes = `${courseLearningMaterials}:eq(0) ${notes}`;
  const firstMesh = `${courseLearningMaterials}:eq(0) ${mesh}`;
  const firstStatus = `${courseLearningMaterials}:eq(0) ${status}`;

  const secondTitle = `${courseLearningMaterials}:eq(1) ${title}`;
  const secondOwner = `${courseLearningMaterials}:eq(1) ${owner}`;
  const secondRequired = `${courseLearningMaterials}:eq(1) ${required}`;
  const secondNotes = `${courseLearningMaterials}:eq(1) ${notes}`;
  const secondMesh = `${courseLearningMaterials}:eq(1) ${mesh}`;
  const secondStatus = `${courseLearningMaterials}:eq(1) ${status}`;

  const thirdTitle = `${courseLearningMaterials}:eq(2) ${title}`;
  const thirdOwner = `${courseLearningMaterials}:eq(2) ${owner}`;
  const thirdRequired = `${courseLearningMaterials}:eq(2) ${required}`;
  const thirdNotes = `${courseLearningMaterials}:eq(2) ${notes}`;
  const thirdMesh = `${courseLearningMaterials}:eq(2) ${mesh}`;
  const thirdStatus = `${courseLearningMaterials}:eq(2) ${status}`;

  const fourthTitle = `${courseLearningMaterials}:eq(3) ${title}`;
  const fourthOwner = `${courseLearningMaterials}:eq(3) ${owner}`;
  const fourthRequired = `${courseLearningMaterials}:eq(3) ${required}`;
  const fourthNotes = `${courseLearningMaterials}:eq(3) ${notes}`;
  const fourthMesh = `${courseLearningMaterials}:eq(3) ${mesh}`;
  const fourthStatus = `${courseLearningMaterials}:eq(3) ${status}`;

  assert.equal(find(courseLearningMaterials).length, 4);
  assert.equal(getElementText(firstTitle), getText('learning material 0'));
  assert.equal(getElementText(firstOwner), getText('0 guy M. Mc0son'));
  assert.equal(getElementText(firstRequired), getText('No'));
  assert.equal(getElementText(firstNotes), getText('No'));
  assert.equal(getElementText(firstMesh), getText('descriptor 1 descriptor 2'));
  assert.equal(getElementText(firstStatus), getText('status 0'));

  assert.equal(getElementText(secondTitle), getText('learning material 1'));
  assert.equal(getElementText(secondOwner), getText('0 guy M. Mc0son'));
  assert.equal(getElementText(secondRequired), getText('No'));
  assert.equal(getElementText(secondNotes), getText('No'));
  assert.equal(getElementText(secondMesh), getText('None'));
  assert.equal(getElementText(secondStatus), getText('status 0'));

  assert.equal(getElementText(thirdTitle), getText('learning material 2'));
  assert.equal(getElementText(thirdOwner), getText('0 guy M. Mc0son'));
  assert.equal(getElementText(thirdRequired), getText('Yes'));
  assert.equal(getElementText(thirdNotes), getText('No'));
  assert.equal(getElementText(thirdMesh), getText('None'));
  assert.equal(getElementText(thirdStatus), getText('status 0'));

  assert.equal(getElementText(fourthTitle), getText('learning material 3'));
  assert.equal(getElementText(fourthOwner), getText('0 guy M. Mc0son'));
  assert.equal(getElementText(fourthRequired), getText('Yes'));
  assert.equal(getElementText(fourthNotes), getText('Yes'));
  assert.equal(getElementText(fourthMesh), getText('None'));
  assert.equal(getElementText(fourthStatus), getText('status 0'));
});

test('create new link learning material', async function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testUrl = 'http://www.ucsf.edu/';
  const searchBox = '.search-box';

  await visit(url);
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);

  assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
  assert.equal(rows.length, 4);
  await click('.detail-learningmaterials-actions .button', container);
  //pick the link type
  await click('.detail-learningmaterials-actions ul li:eq(1)');
  assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
  //check that we got the right form
  let labels = find('.detail-learningmaterials .new-learningmaterial label');
  assert.equal(labels.length, 7);
  const userName = `0 guy M. Mc0son`;
  assert.equal(getElementText(find('.detail-learningmaterials .new-learningmaterial .owninguser')), getText(userName));
  let newLmContainer = find('.detail-learningmaterials .new-learningmaterial');
  let inputs = find('input', newLmContainer);
  let selectBoxes = find('select', newLmContainer);
  await fillIn(inputs.eq(0), testTitle);
  await fillIn(inputs.eq(1), testAuthor);
  await fillIn(inputs.eq(2), testUrl);
  await pickOption(selectBoxes[0], 'status 2', assert);
  await pickOption(selectBoxes[1], 'Role 2', assert);
  find('.fr-box', newLmContainer).froalaEditor('html.set', testDescription);
  find('.fr-box', newLmContainer).froalaEditor('events.trigger', 'contentChanged');
  await click('.detail-learningmaterials .new-learningmaterial .done');
  container = find('.detail-learningmaterials');
  rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, 5);
  let row = rows.eq(4);
  assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
});

test('create new citation learning material', async function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testCitation = 'testsome citation';
  const searchBox = '.search-box';

  await visit(url);
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);

  assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
  assert.equal(rows.length, 4);
  await click('.detail-learningmaterials-actions .button', container);
  //pick the citation type
  await click('.detail-learningmaterials-actions ul li:eq(2)');
  assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
  //check that we got the right form
  let labels = find('.detail-learningmaterials .new-learningmaterial label');
  assert.equal(labels.length, 7);
  const userName = `0 guy M. Mc0son`;
  assert.equal(getElementText(find('.detail-learningmaterials .new-learningmaterial .owninguser')), getText(userName));
  let newLmContainer = find('.detail-learningmaterials .new-learningmaterial');
  let inputs = find('input', newLmContainer);
  let selectBoxes = find('select', newLmContainer);
  await fillIn(inputs.eq(0), testTitle);
  await fillIn(inputs.eq(1), testAuthor);
  await fillIn(find('textarea', newLmContainer).eq(0), testCitation);
  await pickOption(selectBoxes[0], 'status 2', assert);
  await pickOption(selectBoxes[1], 'Role 2', assert);
  find('.fr-box', newLmContainer).froalaEditor('html.set', testDescription);
  find('.fr-box', newLmContainer).froalaEditor('events.trigger', 'contentChanged');
  await click('.detail-learningmaterials .new-learningmaterial .done');
  container = find('.detail-learningmaterials');
  rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, 5);
  let row = rows.eq(4);
  assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
});

test('can only add one learning-material at a time', async function(assert) {
  const addButton = '.detail-learningmaterials-actions .button';
  const fileButton = '.detail-learningmaterials-actions ul li:eq(0)';
  const collapseButton = '.collapse-button';
  const component = '.new-learningmaterial';

  await visit(url);
  await click(addButton);
  await click(fileButton);
  assert.ok(isEmpty(find(addButton)), 'add button is not visible');
  assert.ok(find(collapseButton).is(':visible'), 'new-add collapse button is visible');
  assert.ok(find(component).is(':visible'), 'new-add learning-material component is visible');

  await click(collapseButton);
  assert.ok(find(addButton).is(':visible'), 'add button is visible');
  assert.ok(isEmpty(find(collapseButton)), 'new-add collapse button is not visible');
  assert.ok(isEmpty(find(component)), 'new-add learning-material component is not visible');
});

test('cancel new learning material', async function(assert) {
  await visit(url);
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, 4);
  await click('.detail-learningmaterials-actions .button', container);
  await click('.detail-learningmaterials-actions ul li:eq(0)');
  await click('.detail-learningmaterials .new-learningmaterial .cancel');
  rows = find('.detail-learningmaterials .learning-material-table tbody tr');
  assert.equal(rows.length, 4);

  await wait();
});

test('view copyright file learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  var container = find('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText('learning material 0'));
  assert.equal(getElementText(find('.originalauthor', container)), getText('Jennifer Johnson'));
  assert.equal(getElementText(find('.description', container)), getText('0 lm description'));
  assert.equal(getElementText(find('.copyrightpermission', container)), getText('Yes'));
  assert.equal(find('.copyrightrationale', container).length, 0);
});

test('view rationale file learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(1) td:eq(0) .link');
  var container = find('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText('learning material 1'));
  assert.equal(getElementText(find('.originalauthor', container)), getText('Jennifer Johnson'));
  assert.equal(getElementText(find('.description', container)), getText('1 lm description'));
  assert.equal(getElementText(find('.copyrightrationale', container)), getText('reason is thus'));
  assert.equal(find('.citation', container).length, 0);
  assert.equal(find('.link', container).length, 0);
});

test('view url file learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(1) td:eq(0) .link');
  var container = find('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText('learning material 1'));
  assert.equal(getElementText(find('.originalauthor', container)), getText('Jennifer Johnson'));
  assert.equal(getElementText(find('.description', container)), getText('1 lm description'));
  assert.equal(getElementText(find('.upload-date', container)), moment('2011-03-14').format('M-D-YYYY'));
  assert.equal(getElementText(find('.downloadurl', container)), getText('filename'));
  assert.equal(find('.downloadurl a', container).attr('href'), 'http://example.com/file');
  assert.equal(find('.citation', container).length, 0);
  assert.equal(find('.link', container).length, 0);
});

test('view link learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(2) td:eq(0) .link');
  var container = find('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText('learning material 2'));
  assert.equal(getElementText(find('.originalauthor', container)), getText('Hunter Pence'));
  assert.equal(getElementText(find('.description', container)), getText('2 lm description'));
  assert.equal(getElementText(find('.link', container)), getText('www.example.com'));
  assert.equal(getElementText(find('.upload-date', container)), today.format('M-D-YYYY'));
  assert.equal(find('.copyrightpermission', container).length, 0);
  assert.equal(find('.copyrightrationale', container).length, 0);
  assert.equal(find('.citation', container).length, 0);
  assert.equal(find('.copyrightpermission', container).length, 0);
});

test('view citation learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(3) td:eq(0) .link');
  var container = find('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText('learning material 3'));
  assert.equal(getElementText(find('.originalauthor', container)), getText('Willie Mays'));
  assert.equal(getElementText(find('.description', container)), getText('3 lm description'));
  assert.equal(getElementText(find('.citation', container)), getText('a citation'));
  assert.equal(getElementText(find('.upload-date', container)), moment('2016-12-12').format('M-D-YYYY'));
  assert.equal(find('.copyrightrationale', container).length, 0);
  assert.equal(find('.file', container).length, 0);
  assert.equal(find('.copyrightpermission', container).length, 0);
});

test('edit learning material', async function(assert) {
  const searchBox = '.learningmaterial-search .search-box';

  await visit(url);
  assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  let container = find('.learningmaterial-manager');
  assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while in edit mode');
  await click(find('.required .switch-handle', container));
  await click(find('.publicnotes .switch-handle', container));
  await pickOption(find('.status select', container), 'status 2', assert);
  let newNote = 'text text.  Woo hoo!';
  find('.notes .fr-box', container).froalaEditor('html.set', newNote);
  find('.notes .fr-box', container).froalaEditor('events.trigger', 'contentChanged');
  await click('.buttons .done', container);
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(2)')), getText('Yes'));
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3)')), getText('Yes'), 'there is content in notes');
  assert.ok(isEmpty(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3) i')), 'publicNotes is false and `eye` icon is not visible');
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(5)')), getText('status 2'));

  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  container = find('.learningmaterial-manager');
  assert.equal(getElementText(find('.notes .fr-box', container).froalaEditor('html.get')), getText(`${newNote}`));
  assert.equal(getElementText(find('.status option:selected', container)), getText('status 2'));
  await wait();
});

test('cancel editing learning material', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  var container = find('.learningmaterial-manager');
  await click(find('.required .switch-handle', container));
  await click(find('.publicnotes .switch-handle', container));
  await pickOption(find('.status select', container), 'status 2', assert);
  await click(find('.buttons .cancel', container));
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(2)')), getText('No'));
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3)')), getText('No'), 'no content is available under notes');
  assert.ok(isEmpty(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3) i')), 'publicNotes is true but notes are blank so `eye` icon is not visible');
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(5)')), getText('status 0'));
  await wait();
});

test('manage terms', async function(assert) {
  assert.expect(23);
  await visit(url);
  let container = find('.detail-learningmaterials').eq(0);
  await click('.learning-material-table tbody tr:eq(0) td:eq(0) .link', container);

  let meshManager = find('.mesh-manager', container).eq(0);
  let removableItems = find('.selected-terms li', meshManager);
  assert.equal(removableItems.length, 2);
  assert.equal(getElementText(find('.term-title', removableItems[0]).eq(0)), getText('descriptor 1'));
  assert.equal(getElementText(find('.term-title', removableItems[1]).eq(0)), getText('descriptor 2'));

  let searchBox = find('.search-box', meshManager);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', searchBox);
  let searchResults = find('.mesh-search-results li', meshManager);
  assert.equal(searchResults.length, 6);

  for(let i = 0; i < 6; i++){
    let meshDescriptorName = find('.descriptor-name', searchResults[i]).eq(0);
    assert.equal(getElementText(meshDescriptorName), getText(`descriptor ${i}`));
  }

  assert.notOk(find(searchResults[0]).hasClass('disabled'));
  assert.ok(find(searchResults[1]).hasClass('disabled'));
  assert.ok(find(searchResults[2]).hasClass('disabled'));
  assert.notOk(find(searchResults[3]).hasClass('disabled'));
  assert.notOk(find(searchResults[4]).hasClass('disabled'));
  assert.notOk(find(searchResults[5]).hasClass('disabled'));

  await click('.selected-terms li:eq(0)', meshManager);
  assert.ok(!find('.mesh-search-results li:eq(1)', meshManager).hasClass('disabled'));
  await click(searchResults[0]);
  assert.ok(find('.mesh-search-results li:eq(2)', meshManager).hasClass('disabled'));

  removableItems = find('.selected-terms li', meshManager);
  assert.equal(removableItems.length, 2);
  assert.equal(getElementText(find('.term-title', removableItems[0]).eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(find('.term-title', removableItems[1]).eq(0)), getText('descriptor 2'));

  await wait();
});

test('save terms', async function(assert) {
  assert.expect(1);
  await visit(url);
  let container = find('.detail-learningmaterials').eq(0);
  await click('.learning-material-table tbody tr:eq(0) td:eq(0) .link', container);
  let meshManager = find('.mesh-manager', container).eq(0);
  let searchBoxInput = find('.search-box input', meshManager);
  await fillIn(searchBoxInput, 'descriptor');
  await click('.search-box span.search-icon', meshManager);
  let searchResults = find('.mesh-search-results li', meshManager);
  await click('.selected-terms li:eq(0)', meshManager);
  await click(searchResults[0]);
  await click('.buttons .done', container);
  let expectedMesh = 'descriptor 0' + 'descriptor 2';
  let tds = find('.learning-material-table tbody tr:eq(0) td');
  assert.equal(getElementText(tds.eq(4)), getText(expectedMesh));
});

test('cancel term changes', async function(assert) {
  assert.expect(1);
  await visit(url);
  let container = find('.detail-learningmaterials').eq(0);
  await click('.learning-material-table tbody tr:eq(0) td:eq(0) .link', container);
  let meshManager = find('.mesh-manager', container).eq(0);
  let searchBoxInput = find('.search-box input', meshManager);
  await fillIn(searchBoxInput, 'descriptor');
  await click('.search-box span.search-icon', meshManager);
  let searchResults = find('.mesh-search-results li', meshManager);
  await click('.selected-terms li:eq(0)', meshManager);
  await click(searchResults[2]);
  await click(searchResults[3]);
  await click(searchResults[4]);
  await click('.buttons .cancel', container);
  let tds = find('.learning-material-table tbody tr:eq(0) td');
  let expectedMesh = 'descriptor 1' + 'descriptor 2';
  assert.equal(getElementText(tds.eq(4)), getText(expectedMesh));
});

test('find and add learning material', async function(assert) {
  await visit(url);
  assert.equal(currentPath(), 'course.index');
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, 4);

  let searchBoxInput = find('input', container);
  await fillIn(searchBoxInput, 'doc');
  await triggerEvent(searchBoxInput, 'keyup');
  later(async () =>{
    let searchResults = find('.lm-search-results > li', container);
    assert.equal(searchResults.length, 1);
    assert.equal(getElementText('.lm-search-results > li:eq(0) h4'), getText('Letter to Doc Brown'));
    assert.equal(find('.lm-search-results > li:eq(0) h4 .lm-type-icon .fa-file').length, 1, 'Shows LM type icon.');
    let addlProps = find('.lm-search-results > li:eq(0) .learning-material-properties li', container);
    assert.equal(addlProps.length, 3);
    assert.equal(getElementText('.lm-search-results > li:eq(0) .learning-material-properties li:eq(0)'),
      getText('Owner: 0 guy M. Mc0son'));
    assert.equal(getElementText('.lm-search-results > li:eq(0) .learning-material-properties li:eq(1)'),
      getText('Content Author: ' + 'Marty Mc Fly'));
    assert.equal(getElementText('.lm-search-results > li:eq(0) .learning-material-properties li:eq(2)'),
      getText('Upload date: ' + moment('2016-03-03').format('M-D-YYYY')));
    await click(searchResults[0]);
    rows = find('.learning-material-table tbody tr', container);
    assert.equal(rows.length, 5);
  }, 1000);
  await wait();
});

test('add timed release start date', async function (assert) {
  const container = '.detail-learningmaterials';
  const firstLm = `${container} .learning-material-table tbody tr:eq(0)`;
  const statusIcon = `${firstLm} td:eq(5) i.fa-clock-o`;
  const manageFirstLm = `${firstLm} td:eq(0) .link`;
  const manager = `${container} .learningmaterial-manager`;
  const addStartDate = `${manager} .add-date:eq(0)`;
  const startDate = `${manager} .start-date`;
  const startTime = `${manager} .start-time`;
  const startDatePicker = `${startDate} input`;
  const startTimePicker = `${startTime} select`;
  const releaseSummary = `${manager} .timed-release-schedule`;
  const done = `${manager} .buttons .done`;

  await visit(url);
  assert.notOk(find(statusIcon).length, 'the clock icon is not visible');
  await click(manageFirstLm);

  await click(addStartDate);

  const newDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);
  const interactor = openDatepicker(find(startDatePicker));
  interactor.selectDate(newDate.toDate());

  let startBoxes = find(startTimePicker);
  await pickOption(startBoxes[0], '10', assert);
  await pickOption(startBoxes[1], '10', assert);
  await pickOption(startBoxes[2], 'AM', assert);

  await click(done);
  assert.ok(find(statusIcon).length, 'the clock icon is visible');

  await click(manageFirstLm);
  assert.equal(getElementText(find(releaseSummary)), getText('(Available: ' + newDate.format('L LT') + ')'));
});

test('add timed release start and end date', async function (assert) {
  const container = '.detail-learningmaterials';
  const firstLm = `${container} .learning-material-table tbody tr:eq(0)`;
  const statusIcon = `${firstLm} td:eq(5) i.fa-clock-o`;
  const manageFirstLm = `${firstLm} td:eq(0) .link`;
  const manager = `${container} .learningmaterial-manager`;
  const addStartDate = `${manager} .add-date:eq(0)`;
  const startDate = `${manager} .start-date`;
  const startTime = `${manager} .start-time`;
  const startDatePicker = `${startDate} input`;
  const startTimePicker = `${startTime} select`;
  const addEndDate = `${manager} .add-date:eq(0)`;
  const endDate = `${manager} .end-date`;
  const endTime = `${manager} .end-time`;
  const endDatePicker = `${endDate} input`;
  const endTimePicker = `${endTime} select`;
  const releaseSummary = `${manager} .timed-release-schedule`;
  const done = `${manager} .buttons .done`;

  await visit(url);
  assert.notOk(find(statusIcon).length, 'the clock icon is not visible');
  await click(manageFirstLm);

  await click(addStartDate);

  const startDateInteractor = openDatepicker(find(startDatePicker));

  const newStartDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);
  startDateInteractor.selectDate(newStartDate.toDate());

  let startBoxes = find(startTimePicker);
  await pickOption(startBoxes[0], '10', assert);
  await pickOption(startBoxes[1], '10', assert);
  await pickOption(startBoxes[2], 'AM', assert);

  await click(addEndDate);

  const newEndDate = newStartDate.clone().add(1, 'minute');
  const endDateInteractor = openDatepicker(find(endDatePicker));
  endDateInteractor.selectDate(newEndDate.toDate());

  let endBoxes = find(endTimePicker);
  await pickOption(endBoxes[0], '10', assert);
  await pickOption(endBoxes[1], '11', assert);
  await pickOption(endBoxes[2], 'AM', assert);

  await click(done);
  assert.ok(find(statusIcon).length, 'the clock icon is visible');

  await click(manageFirstLm);
  assert.equal(getElementText(find(releaseSummary)), getText('(Available: ' + newStartDate.format('L LT') + ' and available until ' + newEndDate.format('L LT') + ')'));
});

test('add timed release end date', async function (assert) {
  const container = '.detail-learningmaterials';
  const firstLm = `${container} .learning-material-table tbody tr:eq(0)`;
  const statusIcon = `${firstLm} td:eq(5) i.fa-clock-o`;
  const manageFirstLm = `${firstLm} td:eq(0) .link`;
  const manager = `${container} .learningmaterial-manager`;
  const addEndDate = `${manager} .add-date:eq(1)`;
  const endDate = `${manager} .end-date`;
  const endTime = `${manager} .end-time`;
  const endDatePicker = `${endDate} input`;
  const endTimePicker = `${endTime} select`;
  const releaseSummary = `${manager} .timed-release-schedule`;
  const done = `${manager} .buttons .done`;

  await visit(url);
  assert.notOk(find(statusIcon).length, 'the clock icon is not visible');
  await click(manageFirstLm);

  await click(addEndDate);

  const newDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);
  const interactor = openDatepicker(find(endDatePicker));
  interactor.selectDate(newDate.toDate());

  let endBoxes = find(endTimePicker);
  await pickOption(endBoxes[0], '10', assert);
  await pickOption(endBoxes[1], '10', assert);
  await pickOption(endBoxes[2], 'AM', assert);

  await click(done);
  assert.ok(find(statusIcon).length, 'the clock icon is visible');

  await click(manageFirstLm);
  assert.equal(getElementText(find(releaseSummary)), getText('(Available until ' + newDate.format('L LT') + ')'));
});

test('end date is after start date', async function (assert) {
  const container = '.detail-learningmaterials';
  const firstLm = `${container} .learning-material-table tbody tr:eq(0)`;
  const statusIcon = `${firstLm} td:eq(5) i.fa-clock-o`;
  const manageFirstLm = `${firstLm} td:eq(0) .link`;
  const manager = `${container} .learningmaterial-manager`;
  const addStartDate = `${manager} .add-date:eq(0)`;
  const startDate = `${manager} .start-date`;
  const startTime = `${manager} .start-time`;
  const startDatePicker = `${startDate} input`;
  const startTimePicker = `${startTime} select`;
  const addEndDate = `${manager} .add-date:eq(0)`;
  const endDate = `${manager} .end-date`;
  const endTime = `${manager} .end-time`;
  const endDatePicker = `${endDate} input`;
  const endTimePicker = `${endTime} select`;
  const releaseSummary = `${manager} .timed-release-schedule`;
  const done = `${manager} .buttons .done`;
  const errorMessage = `${manager} .validation-error-message`;

  await visit(url);
  assert.notOk(find(statusIcon).length, 'the clock icon is not visible');
  assert.equal(find(manager).length, 0, 'manager is not initially displayed');
  await click(manageFirstLm);

  await click(addStartDate);

  const startDateInteractor = openDatepicker(find(startDatePicker));

  const newStartDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);
  startDateInteractor.selectDate(newStartDate.toDate());

  let startBoxes = find(startTimePicker);
  await pickOption(startBoxes[0], '10', assert);
  await pickOption(startBoxes[1], '10', assert);
  await pickOption(startBoxes[2], 'AM', assert);

  await click(addEndDate);

  const newEndDate = newStartDate.clone();
  const endDateInteractor = openDatepicker(find(endDatePicker));
  endDateInteractor.selectDate(newEndDate.toDate());

  let endBoxes = find(endTimePicker);
  await pickOption(endBoxes[0], '10', assert);
  await pickOption(endBoxes[1], '10', assert);
  await pickOption(endBoxes[2], 'AM', assert);

  assert.equal(find(errorMessage).length, 0, 'ne error displays initially');
  await click(done);
  assert.equal(find(manager).length, 1, 'the manager is still showing since there was an error');
  assert.equal(getElementText(find(releaseSummary)), getText('(Available: ' + newStartDate.format('L LT') + ' and available until ' + newEndDate.format('L LT') + ')'), 'Check summary text');
  assert.equal(find(errorMessage).length, 1, 'the error message shows up');
});
