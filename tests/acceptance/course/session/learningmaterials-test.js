import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';

const { isEmpty, isPresent, run } = Ember;
const { later } = run;

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Learning Materials', {
  beforeEach: function() {
    application = startApp();
    fixtures.user = setupAuthentication(application);
    server.create('school');
    server.create('academicYear');
    server.create('course', {
      sessions: [1]
    });
    server.create('sessionType');
    fixtures.statuses = [];
    fixtures.statuses.pushObject(server.create('learningMaterialStatus', {
      learningMaterials: [1]
    }));
    fixtures.statuses.pushObjects(server.createList('learningMaterialStatus', 5));
    fixtures.roles = server.createList('learningMaterialUserRole', 3);
    fixtures.meshDescriptors = [];
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor'));
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      sessionLearningMaterials: [1],
    }));
    fixtures.meshDescriptors.pushObject(server.create('meshDescriptor', {
      sessionLearningMaterials: [1],
    }));
    fixtures.meshDescriptors.pushObjects(server.createList('meshDescriptor', 3));
    fixtures.learningMaterials = [];
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      owningUser: 4136,
      status: 1,
      userRole: 1,
      copyrightPermission: true,
      filename: 'something.pdf',
      absoluteFileUri: 'http://somethingsomething.com/something.pdf',
      sessionLearningMaterials: [1],
      uploadDate: new Date(),
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      owningUser: 4136,
      status: 1,
      userRole: 1,
      copyrightPermission: false,
      copyrightRationale: 'reason is thus',
      filename: 'filename',
      absoluteFileUri: 'http://example.com/file',
      sessionLearningMaterials: [2],
      uploadDate: new Date(),
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Hunter Pence',
      link: 'www.example.com',
      status: 1,
      owningUser: 4136,
      userRole: 1,
      copyrightPermission: true,
      sessionLearningMaterials: [3],
      uploadDate: new Date(),
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Willie Mays',
      citation: 'a citation',
      status: 1,
      owningUser: 4136,
      userRole: 1,
      copyrightPermission: true,
      sessionLearningMaterials: [4],
      uploadDate: new Date(),
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      title: 'Letter to Doc Brown',
      originalAuthor: 'Marty McFly',
      owningUser: 4136,
      status: 1,
      userRole: 1,
      copyrightPermission: true,
      courseLearningMaterials: [],
      uploadDate: new Date(),
      filename: 'letter.txt',
      absoluteFileUri: 'http://bttf.com/letter.txt'
    }));
    fixtures.sessionLearningMaterials = [];
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 1,
      session: 1,
      required: false,
      meshDescriptors: [2,3],
      position: 0,
    }));
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 2,
      session: 1,
      required: false,
      position: 1,
    }));
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 3,
      session: 1,
      publicNotes: false,
      position: 2,
    }));
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 4,
      session: 1,
      position: 3,
      notes: 'somethings tested this way comes',
      startDate: new Date(),
    }));

    fixtures.session = server.create('session', {
      year: 2013,
      school: 1,
      learningMaterials: [1, 2, 3, 4],
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list learning materials', async function(assert) {
  await visit(url);
  const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
  const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
  assert.equal(currentPath(), 'course.session.index');
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, fixtures.session.learningMaterials.length);
  for (let i = 0; i < fixtures.session.learningMaterials.length; i++){
    let row = rows.eq(i);
    let sessionLm = fixtures.sessionLearningMaterials[fixtures.session.learningMaterials[i] - 1];
    let lm = fixtures.learningMaterials[sessionLm.learningMaterial - 1];
    assert.equal(getElementText(find('td:eq(0)', row)), getText(lm.title));
    // TODO: not checking for exact type icon yet, see comment below [ST 2017/08/01]
    assert.equal(find('td:eq(0) .lm-type-icon i.fa', row).length, 1, 'LM type icon is present.');
    //TODO: we are no longer populating for 'type', so we need to pull all these tests out
    //of the loop and test each fixture individually
    //assert.equal(getElementText(find('td:eq(1)', row)), getText(lm.type));
    let required = sessionLm.required?'Yes':'No';
    assert.equal(getElementText(find('td:eq(1)', row)), getText(userName));
    assert.equal(getElementText(find('td:eq(2)', row)), getText(required));
    let notes = sessionLm.notes? 'Yes' : 'No';
    assert.equal(getElementText(find('td:eq(3)', row)), getText(notes));
    let notesBool = sessionLm.notes? true : false;
    let publicNotes = sessionLm.publicNotes ? true : false;
    assert.equal(find('td:eq(3) i', row).hasClass('fa-eye'), publicNotes && notesBool);
    let meshTerms = find('td:eq(4) li', row);
    if('meshDescriptors' in sessionLm){
      assert.equal(meshTerms.length, sessionLm.meshDescriptors.length);
      for(let i = 0; i < sessionLm.meshDescriptors.length; i++){
        assert.equal(getElementText(meshTerms.eq(i)), getText(fixtures.meshDescriptors[sessionLm.meshDescriptors[i] - 1].name));
      }
    }
    assert.equal(getElementText(find('td:eq(5)', row)), getText('status 0'));
    if ('startDate' in sessionLm) {
      assert.equal(find('td:eq(5) i.fa-clock-o', row).length, 1);
    } else {
      assert.equal(find('td:eq(5) i.fa-clock-o', row).length, 0);
    }
  }
});

test('create new link learning material', async function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testUrl = 'http://www.ucsf.edu/';
  const searchBox = '.learningmaterial-search .search-box';

  await visit(url);
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);

  assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
  assert.equal(rows.length, fixtures.session.learningMaterials.length);
  await click('.detail-learningmaterials-actions .button', container);
  //pick the link type
  await click('.detail-learningmaterials-actions ul li:eq(1)');
  assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
  //check that we got the right form
  let labels = find('.detail-learningmaterials .new-learningmaterial label');
  assert.equal(labels.length, 7);
  const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
  const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
  assert.equal(getElementText(find('.detail-learningmaterials .new-learningmaterial .owninguser')), getText(userName));
  let newLmContainer = find('.detail-learningmaterials .new-learningmaterial');
  let inputs = find('input', newLmContainer);
  let selectBoxes = find('select', newLmContainer);
  await fillIn(inputs.eq(0), testTitle);
  await fillIn(inputs.eq(1), testAuthor);
  await fillIn(inputs.eq(2), testUrl);
  await pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
  await pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
  find('.fr-box', newLmContainer).froalaEditor('html.set', testDescription);
  find('.fr-box', newLmContainer).froalaEditor('events.trigger', 'contentChanged');
  await click('.detail-learningmaterials .new-learningmaterial .done');
  container = find('.detail-learningmaterials');
  rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
  let row = rows.eq(fixtures.session.learningMaterials.length);
  assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
});

test('create new citation learning material', async function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testCitation = 'testsome citation';
  const searchBox = '.learningmaterial-search .search-box';

  await visit(url);
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);

  assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
  assert.equal(rows.length, fixtures.session.learningMaterials.length);
  await click('.detail-learningmaterials-actions .button', container);
  //pick the citation type
  await click('.detail-learningmaterials-actions ul li:eq(2)');
  assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
  //check that we got the right form
  let labels = find('.detail-learningmaterials .new-learningmaterial label');
  assert.equal(labels.length, 7);
  const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
  const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
  assert.equal(getElementText(find('.detail-learningmaterials .new-learningmaterial .owninguser')), getText(userName));
  let newLmContainer = find('.detail-learningmaterials .new-learningmaterial');
  let inputs = find('input', newLmContainer);
  let selectBoxes = find('select', newLmContainer);
  await fillIn(inputs.eq(0), testTitle);
  await fillIn(inputs.eq(1), testAuthor);
  await fillIn(find('textarea', newLmContainer).eq(0), testCitation);
  await pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
  await pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
  find('.fr-box', newLmContainer).froalaEditor('html.set', testDescription);
  find('.fr-box', newLmContainer).froalaEditor('events.trigger', 'contentChanged');
  await click('.detail-learningmaterials .new-learningmaterial .done');
  container = find('.detail-learningmaterials');
  rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
  let row = rows.eq(fixtures.session.learningMaterials.length);
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
  assert.equal(rows.length, fixtures.session.learningMaterials.length);
  await click('.detail-learningmaterials-actions .button', container);
  await click('.detail-learningmaterials-actions ul li:eq(0)');
  await click('.detail-learningmaterials .new-learningmaterial .cancel');
  rows = find('.detail-learningmaterials .learning-material-table tbody tr');
  assert.equal(rows.length, fixtures.session.learningMaterials.length);
  await wait();
});

test('view copyright file learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  var container = $('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[0].title));
  assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[0].originalAuthor));
  assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[0].description));
  assert.equal(getElementText(find('.copyrightpermission', container)), getText('Yes'));
  assert.equal(find('.copyrightrationale', container).length, 0);
});

test('view rationale file learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(1) td:eq(0) .link');
  var container = $('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[1].title));
  assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[1].originalAuthor));
  assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[1].description));
  assert.equal(getElementText(find('.copyrightrationale', container)), getText(fixtures.learningMaterials[1].copyrightRationale));
  assert.equal(find('.citation', container).length, 0);
  assert.equal(find('.link', container).length, 0);
});

test('view link learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(2) td:eq(0) .link');
  var container = $('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[2].title));
  assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[2].originalAuthor));
  assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[2].description));
  assert.equal(getElementText(find('.upload-date', container)),
    moment(fixtures.learningMaterials[2].uploadDate).format('M-D-YYYY'));
  assert.equal(getElementText(find('.link', container)), getText(fixtures.learningMaterials[2].link));
  assert.equal(find('.copyrightpermission', container).length, 1);
  assert.equal(find('.copyrightrationale', container).length, 0);
  assert.equal(find('.citation', container).length, 0);
});

test('view citation learning material details', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(3) td:eq(0) .link');
  var container = $('.learningmaterial-manager');
  assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[3].title));
  assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[3].originalAuthor));
  assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[3].description));
  assert.equal(getElementText(find('.upload-date', container)),
    moment(fixtures.learningMaterials[2].uploadDate).format('M-D-YYYY'));
  assert.equal(getElementText(find('.citation', container)), getText(fixtures.learningMaterials[3].citation));
  assert.equal(find('.copyrightpermission', container).length, 1);
  assert.equal(find('.copyrightrationale', container).length, 0);
  assert.equal(find('.file', container).length, 0);
});

test('edit learning material', async function(assert) {
  const searchBox = '.learningmaterial-search .search-box';

  await visit(url);
  assert.ok(isPresent(find(searchBox)), 'learner-gorup search box is visible');
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  let container = $('.learningmaterial-manager');
  assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while in edit mode');
  await click(find('.required .switch-handle', container));
  await click(find('.publicnotes .switch-handle', container));
  await pickOption(find('.status select', container), fixtures.statuses[2].title, assert);
  let newNote = 'text text.  Woo hoo!';
  find('.notes .fr-box', container).froalaEditor('html.set', newNote);
  find('.notes .fr-box', container).froalaEditor('events.trigger', 'contentChanged');
  await click('.buttons .done', container);
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(2)')), getText('Yes'));
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3)')), getText('Yes'), 'there is content in notes');
  assert.ok(isEmpty(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3) i')), 'publicNotes is false and `eye` icon is not visible');
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(5)')), getText(fixtures.statuses[2].title));

  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  container = $('.learningmaterial-manager');
  assert.equal(getElementText(find('.notes .fr-box', container).froalaEditor('html.get')), getText(`${newNote}`));
  assert.equal(getElementText(find('.status option:selected', container)), getText('status 2'));
  await wait();
});

test('cancel editing learning material', async function(assert) {
  await visit(url);
  await click('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(0) .link');
  var container = $('.learningmaterial-manager');
  await click(find('.required .switch-handle', container));
  await click(find('.publicnotes .switch-handle', container));
  await pickOption(find('.status select', container), fixtures.statuses[2].title, assert);
  await click('.buttons .cancel', container);
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(2)')), getText('No'));
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3)')), getText('No'), 'no content is available under notes');
  assert.ok(isEmpty(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(3) i')), 'publicNotes is true but notes are blank so `eye` icon is not visible');
  assert.equal(getElementText(find('.detail-learningmaterials .learning-material-table tbody tr:eq(0) td:eq(5)')), getText(fixtures.statuses[0].title));
});

test('manage terms', async function(assert) {
  assert.expect(23);
  await visit(url);
  let container = find('.detail-learningmaterials').eq(0);
  await click('.learning-material-table tbody tr:eq(0) td:eq(0) .link', container);

  let meshManager = find('.mesh-manager', container).eq(0);
  let material = fixtures.sessionLearningMaterials[0];
  let removableItems = find('.removable-list li', meshManager);
  assert.equal(removableItems.length, material.meshDescriptors.length);
  for (let i = 0; i < material.meshDescriptors.length; i++){
    let meshDescriptionName = find('.content .title', removableItems[i]).eq(0);
    assert.equal(getElementText(meshDescriptionName), getText(fixtures.meshDescriptors[material.meshDescriptors[i] - 1].name));
  }

  let searchBox = find('.search-box', meshManager);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', searchBox);
  let searchResults = find('.mesh-search-results li', meshManager);
  assert.equal(searchResults.length, fixtures.meshDescriptors.length);

  for(let i = 0; i < fixtures.meshDescriptors.length; i++){
    let meshDescriptorName = find('.descriptor-name', searchResults[i]).eq(0);
    assert.equal(getElementText(meshDescriptorName), getText(fixtures.meshDescriptors[i].name));
  }

  for (let i = 0; i < fixtures.meshDescriptors.length; i++){
    if(material.meshDescriptors.indexOf(fixtures.meshDescriptors[i].id) !== -1){
      assert.ok($(searchResults[i]).hasClass('disabled'));
    } else {
      assert.ok(!$(searchResults[i]).hasClass('disabled'));
    }
  }
  await click('.removable-list li:eq(0)', meshManager);
  assert.ok(!$(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
  await click(searchResults[0]);
  assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'));

  let newExpectedMesh = [
    fixtures.meshDescriptors[0],
    fixtures.meshDescriptors[2]
  ];
  removableItems = find('.removable-list li', meshManager);
  assert.equal(removableItems.length, 2);
  for (let i = 0; i < 2; i++){
    let meshDescriptorName = find('.title', removableItems[i]).eq(0);
    assert.equal(getElementText(meshDescriptorName), getText(newExpectedMesh[i].name));
  }

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
  await click('.removable-list li:eq(0)', meshManager);
  await click(searchResults[0]);
  await click('.buttons .done', container);
  let expectedMesh = fixtures.meshDescriptors[0].name + fixtures.meshDescriptors[2].name;
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
  await click('.removable-list li:eq(0)', meshManager);
  await click(searchResults[2]);
  await click(searchResults[3]);
  await click(searchResults[4]);
  await click('.buttons .cancel', container);
  let tds = find('.learning-material-table tbody tr:eq(0) td');
  let expectedMesh = fixtures.meshDescriptors[1].name + fixtures.meshDescriptors[2].name;
  assert.equal(getElementText(tds.eq(4)), getText(expectedMesh));
});

test('find and add learning material', async function(assert) {
  await visit(url);
  assert.equal(currentPath(), 'course.session.index');
  let container = find('.detail-learningmaterials');
  let rows = find('.learning-material-table tbody tr', container);
  assert.equal(rows.length, fixtures.session.learningMaterials.length);

  let searchBoxInput = find('input', container);
  fillIn(searchBoxInput, 'doc');
  await triggerEvent(searchBoxInput, 'keyup');
  later(async () => {
    let searchResults = find('.lm-search-results > li', container);
    assert.equal(searchResults.length, 1);
    assert.equal(getElementText($('.lm-search-results > li:eq(0) h4')), getText('Letter to Doc Brown'));
    assert.equal(find('.lm-search-results > li:eq(0) h4 .lm-type-icon .fa-file').length, 1, 'Shows LM type icon.');
    let addlProps = find('.lm-search-results > li:eq(0) .learning-material-properties li', container);
    assert.equal(addlProps.length, 3);
    assert.equal(getElementText($('.lm-search-results > li:eq(0) .learning-material-properties li:eq(0)')),
      getText('Owner: 0 guy M. Mc0son'));
    assert.equal(getElementText($('.lm-search-results > li:eq(0) .learning-material-properties li:eq(1)')),
      getText('Content Author: ' + fixtures.learningMaterials[4].originalAuthor));
    assert.equal(getElementText($('.lm-search-results > li:eq(0) .learning-material-properties li:eq(2)')),
      getText('Upload date: ' + moment(fixtures.learningMaterials[4].uploadDate).format('M-D-YYYY')));
    await click(searchResults[0]);

    rows = find('.learning-material-table tbody tr', container);
    assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
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
  assert.equal(getElementText(find(releaseSummary)), getText('Available after ' + newDate.format('L LT')));
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
  assert.equal(getElementText(find(releaseSummary)), getText('Available from ' + newStartDate.format('L LT') + ' until ' + newEndDate.format('L LT')));
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
  assert.equal(getElementText(find(releaseSummary)), getText('Available before ' + newDate.format('L LT')));
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
  assert.equal(getElementText(find(releaseSummary)), getText('Available from ' + newStartDate.format('L LT') + ' until ' + newEndDate.format('L LT')), 'Check summary text');
  assert.equal(find(errorMessage).length, 1, 'the error message shows up');
});
