import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test,
  skip
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';
import moment from 'moment';

const { isEmpty, isPresent, run } = Ember;
const { later } = run;

let application;
let fixtures = {};
let url = '/courses/1?details=true';
module('Acceptance: Course - Learning Materials', {
  beforeEach: function() {
    application = startApp();
    const user = setupAuthentication(application);
    const school = server.create('school');
    server.create('academicYear');
    const status = server.create('learningMaterialStatus');
    const userRole = server.create('learningMaterialUserRole');
    server.createList('learningMaterialStatus', 5);
    server.createList('learningMaterialUserRole', 5);
    const meshDescriptors = server.createList('meshDescriptor', 3);
    const lm1 = server.create('learningMaterial', {
      originalAuthor: 'Jennifer Johnson',
      owningUser: user,
      link: 'www.example.com',
      status,
      userRole,
      copyrightPermission: true,
    });
    const lm2 = server.create('learningMaterial',{
      originalAuthor: 'Jennifer Johnson',
      owningUser: user,
      status,
      userRole,
      copyrightPermission: false,
      copyrightRationale: 'reason is thus',
      filename: 'filename',
      absoluteFileUri: 'http://example.com/file',
    });
    const lm3 = server.create('learningMaterial',{
      originalAuthor: 'Hunter Pence',
      link: 'www.example.com',
      status,
      owningUser: user,
    });
    const lm4 = server.create('learningMaterial',{
      originalAuthor: 'Willie Mays',
      citation: 'a citation',
      status,
      owningUser: user,
    });
    server.create('learningMaterial',{
      title: 'Letter to Doc Brown',
      originalAuthor: 'Marty McFly',
      owningUser: user,
      status,
      userRole,
      copyrightPermission: true,
    });
    const course = server.create('course', {
      year: 2013,
      school,
    });

    server.create('courseLearningMaterial',{
      learningMaterial: lm1,
      course,
      required: false,
      meshDescriptors: [meshDescriptors[0], meshDescriptors[1]],
      position: 0,
    });
    server.create('courseLearningMaterial',{
      learningMaterial: lm2,
      course,
      required: false,
      position: 1,
    });
    server.create('courseLearningMaterial',{
      learningMaterial: lm3,
      course,
      publicNotes: false,
      position: 2,
    });
    server.create('courseLearningMaterial',{
      learningMaterial: lm4,
      course,
      position: 3,
    });


  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('list learning materials', async function(assert) {
  assert.expect(31);

  const container = '.detail-learningmaterials:eq(0)';
  const learningMaterials = `${container} tbody tr`;
  const firstLmTitle = `${learningMaterials}:eq(0) td:eq(0)`;
  const firstLmType = `${learningMaterials}:eq(0) td:eq(1)`;
  const firstLmOwnerName = `${learningMaterials}:eq(0) td:eq(2)`;
  const firstLmRequired = `${learningMaterials}:eq(0) td:eq(3)`;
  const firstLmNotes = `${learningMaterials}:eq(0) td:eq(4)`;
  const firstLmMesh = `${learningMaterials}:eq(0) td:eq(5)`;
  const firstLmStatus = `${learningMaterials}:eq(0) td:eq(6)`;

  const secondLmTitle = `${learningMaterials}:eq(1) td:eq(0)`;
  const secondLmType = `${learningMaterials}:eq(1) td:eq(1)`;
  const secondLmOwnerName = `${learningMaterials}:eq(1) td:eq(2)`;
  const secondLmRequired = `${learningMaterials}:eq(1) td:eq(3)`;
  const secondLmNotes = `${learningMaterials}:eq(1) td:eq(4)`;
  const secondLmMesh = `${learningMaterials}:eq(1) td:eq(5)`;
  const secondLmStatus = `${learningMaterials}:eq(1) td:eq(6)`;

  const thirdLmTitle = `${learningMaterials}:eq(2) td:eq(0)`;
  const thirdLmType = `${learningMaterials}:eq(2) td:eq(1)`;
  const thirdLmOwnerName = `${learningMaterials}:eq(2) td:eq(2)`;
  const thirdLmRequired = `${learningMaterials}:eq(2) td:eq(3)`;
  const thirdLmNotes = `${learningMaterials}:eq(2) td:eq(4)`;
  const thirdLmMesh = `${learningMaterials}:eq(2) td:eq(5)`;
  const thirdLmStatus = `${learningMaterials}:eq(2) td:eq(6)`;

  const fourthLmTitle = `${learningMaterials}:eq(3) td:eq(0)`;
  const fourthLmType = `${learningMaterials}:eq(3) td:eq(1)`;
  const fourthLmOwnerName = `${learningMaterials}:eq(3) td:eq(2)`;
  const fourthLmRequired = `${learningMaterials}:eq(3) td:eq(3)`;
  const fourthLmNotes = `${learningMaterials}:eq(3) td:eq(4)`;
  const fourthLmMesh = `${learningMaterials}:eq(3) td:eq(5)`;
  const fourthLmStatus = `${learningMaterials}:eq(3) td:eq(6)`;

  server.logging = true;
  await visit(url);
  assert.equal(currentPath(), 'course.index');
  assert.equal(find(learningMaterials).length, 4);
  assert.equal(find(firstLmTitle).text().trim(), 'learning material 0', 'firstLm title');
  assert.equal(find(firstLmType).text().trim(), 'link', 'firstLm type');
  assert.equal(find(firstLmOwnerName).text().trim(), '0 guy M. Mc0son', 'firstLm ownerName');
  assert.equal(find(firstLmRequired).text().trim(), 'No', 'firstLm required');
  assert.equal(find(firstLmNotes).text().trim(), 'No', 'firstLm notes');
  assert.ok(find(firstLmMesh).text().includes('descriptor 0'), 'firstLm mesh');
  assert.ok(find(firstLmMesh).text().includes('descriptor 1'), 'firstLm mesh');
  assert.equal(find(firstLmStatus).text().trim(), 'status 0', 'firstLm status');

  assert.equal(find(secondLmTitle).text().trim(), 'learning material 1', 'secondLm title');
  assert.equal(find(secondLmType).text().trim(), 'file', 'secondLm type');
  assert.equal(find(secondLmOwnerName).text().trim(), '0 guy M. Mc0son', 'secondLm ownerName');
  assert.equal(find(secondLmRequired).text().trim(), 'No', 'secondLm required');
  assert.equal(find(secondLmNotes).text().trim(), 'No', 'secondLm notes');
  assert.equal(find(secondLmMesh).text().trim(), 'Add New', 'secondLm mesh');
  assert.equal(find(secondLmStatus).text().trim(), 'status 0', 'secondLm status');

  assert.equal(find(thirdLmTitle).text().trim(), 'learning material 2', 'thirdLm title');
  assert.equal(find(thirdLmType).text().trim(), 'link', 'thirdLm type');
  assert.equal(find(thirdLmOwnerName).text().trim(), '0 guy M. Mc0son', 'thirdLm ownerName');
  assert.equal(find(thirdLmRequired).text().trim(), 'Yes', 'thirdLm required');
  assert.equal(find(thirdLmNotes).text().trim(), 'No', 'thirdLm notes');
  assert.equal(find(thirdLmMesh).text().trim(), 'Add New', 'thirdLm mesh');
  assert.equal(find(thirdLmStatus).text().trim(), 'status 0', 'thirdLm status');

  assert.equal(find(fourthLmTitle).text().trim(), 'learning material 3', 'fourthLm title');
  assert.equal(find(fourthLmType).text().trim(), 'citation', 'fourthLm type');
  assert.equal(find(fourthLmOwnerName).text().trim(), '0 guy M. Mc0son', 'fourthLm ownerName');
  assert.equal(find(fourthLmRequired).text().trim(), 'Yes', 'fourthLm required');
  assert.equal(find(fourthLmNotes).text().trim(), 'No', 'fourthLm notes');
  assert.equal(find(fourthLmMesh).text().trim(), 'Add New', 'fourthLm mesh');
  assert.equal(find(fourthLmStatus).text().trim(), 'status 0', 'fourthLm status');
});

//we can't upload a file so we cant run this test
skip('create new file learning material', function() {
});

test('create new link learning material', function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testUrl = 'http://www.ucsf.edu/';
  const searchBox = '.search-box';

  visit(url);
  andThen(function() {
    let container = find('.detail-learningmaterials');
    let rows = find('.detail-learningmaterials-content tbody tr', container);

    assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
    assert.equal(rows.length, 4);
    click('.detail-learningmaterials-actions .button', container).then(function(){
      //pick the link type
      click('.detail-learningmaterials-actions ul li:eq(1)');
    });
  });
  andThen(function(){
    assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
    //check that we got the right form
    let labels = find('.detail-learningmaterials .new-learning-material label');
    assert.equal(labels.length, 7);
    assert.equal(getElementText(find('.detail-learningmaterials .new-learning-material .owninguser')), getText('0 guy M. Mc0son'));
    let newLmContainer = find('.detail-learningmaterials .new-learning-material');
    let inputs = find('input', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(inputs.eq(2), testUrl);
    pickOption(selectBoxes[0], 'status 2', assert);
    pickOption(selectBoxes[1], 'user role 2', assert);
    find('.fr-box', newLmContainer).froalaEditor('html.set', testDescription);
    find('.fr-box', newLmContainer).froalaEditor('events.trigger', 'contentChanged');
    click('.detail-learningmaterials .new-learning-material .done');
    andThen(function(){
      let container = find('.detail-learningmaterials');
      let rows = find('.detail-learningmaterials-content tbody tr', container);
      assert.equal(rows.length, 5);
      let row = rows.eq(4);
      assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
      assert.equal(getElementText(find('td:eq(1)', row)), getText('link'));
    });
  });

});

test('create new citation learning material', function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testCitation = 'testsome citation';
  const searchBox = '.search-box';

  visit(url);
  andThen(function() {
    let container = find('.detail-learningmaterials');
    let rows = find('.detail-learningmaterials-content tbody tr', container);

    assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
    assert.equal(rows.length, 4);
    click('.detail-learningmaterials-actions .button', container).then(function(){
      //pick the citation type
      click('.detail-learningmaterials-actions ul li:eq(2)');
    });
  });
  andThen(function(){
    assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
    //check that we got the right form
    let labels = find('.detail-learningmaterials .new-learning-material label');
    assert.equal(labels.length, 7);
    assert.equal(getElementText(find('.detail-learningmaterials .new-learning-material .owninguser')), getText('0 guy M. Mc0son'));
    let newLmContainer = find('.detail-learningmaterials .new-learning-material');
    let inputs = find('input', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(find('textarea', newLmContainer).eq(0), testCitation);
    pickOption(selectBoxes[0], 'status 2', assert);
    pickOption(selectBoxes[1], 'user role 2', assert);
    find('.fr-box', newLmContainer).froalaEditor('html.set', testDescription);
    find('.fr-box', newLmContainer).froalaEditor('events.trigger', 'contentChanged');
    click('.detail-learningmaterials .new-learning-material .done');
    andThen(function(){
      let container = find('.detail-learningmaterials');
      let rows = find('.detail-learningmaterials-content tbody tr', container);
      assert.equal(rows.length, 4 + 1);
      let row = rows.eq(4);
      assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
      assert.equal(getElementText(find('td:eq(1)', row)), getText('citation'));
    });
  });
});

test('can only add one learning-material at a time', function(assert) {
  const addButton = '.detail-learningmaterials-actions .button';
  const fileButton = '.detail-learningmaterials-actions ul li:eq(0)';
  const collapseButton = '.collapse-button';
  const component = '.new-learning-material';

  visit(url);
  click(addButton);
  click(fileButton);
  andThen(() => {
    assert.ok(isEmpty(find(addButton)), 'add button is not visible');
    assert.ok(find(collapseButton).is(':visible'), 'new-add collapse button is visible');
    assert.ok(find(component).is(':visible'), 'new-add learning-material component is visible');
  });

  click(collapseButton);
  andThen(() => {
    assert.ok(find(addButton).is(':visible'), 'add button is visible');
    assert.ok(isEmpty(find(collapseButton)), 'new-add collapse button is not visible');
    assert.ok(isEmpty(find(component)), 'new-add learning-material component is not visible');
  });
});

test('cancel new learning material', function(assert) {
  visit(url);
  andThen(function() {
    let container = find('.detail-learningmaterials');
    let rows = find('.detail-learningmaterials-content tbody tr', container);
    assert.equal(rows.length, 4);
    click('.detail-learningmaterials-actions .button', container);
    click('.detail-learningmaterials-actions ul li:eq(0)');
  });
  andThen(function(){
    click('.detail-learningmaterials .new-learning-material .cancel');
  });
  andThen(function(){
    let rows = find('.detail-learningmaterials .detail-learningmaterials-content tbody tr');
    assert.equal(rows.length, 4);
  });

});

test('view copyright file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText('learning material 0'));
      assert.equal(getElementText(find('.originalauthor', container)), getText('Jennifer Johnson'));
      assert.equal(getElementText(find('.description', container)), getText('0 lm description'));
      assert.equal(getElementText(find('.copyrightpermission', container)), getText('Yes'));
      assert.equal(find('.copyrightrationale', container).length, 0);
    });
  });
});

test('view rationale file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(1) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText('learning material 1'));
      assert.equal(getElementText(find('.originalauthor', container)), getText('Jennifer Johnson'));
      assert.equal(getElementText(find('.description', container)), getText('1 lm description'));
      assert.equal(getElementText(find('.copyrightrationale', container)), getText('reason is thus'));
      assert.equal(find('.citation', container).length, 0);
      assert.equal(find('.link', container).length, 0);
    });
  });
});

test('view url file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(1) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText('learning material 1'));
      assert.equal(getElementText(find('.originalauthor', container)), getText('Jennifer Johnson'));
      assert.equal(getElementText(find('.description', container)), getText('1 lm description'));
      assert.equal(getElementText(find('.upload-date', container)), moment().format('M-D-YYYY'));
      assert.equal(getElementText(find('.downloadurl', container)), getText('filename'));
      assert.equal(find('.downloadurl a', container).attr('href'), 'http://example.com/file');
      assert.equal(find('.citation', container).length, 0);
      assert.equal(find('.link', container).length, 0);
    });
  });
});

test('view link learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(2) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText('learning material 2'));
      assert.equal(getElementText(find('.originalauthor', container)), getText('Hunter Pence'));
      assert.equal(getElementText(find('.description', container)), getText('2 lm description'));
      assert.equal(getElementText(find('.link', container)), getText('www.example.com'));
      assert.equal(getElementText(find('.upload-date', container)), moment().format('M-D-YYYY'));
      assert.equal(find('.copyrightpermission', container).length, 0);
      assert.equal(find('.copyrightrationale', container).length, 0);
      assert.equal(find('.citation', container).length, 0);
      assert.equal(find('.copyrightpermission', container).length, 0);
    });
  });
});

test('view citation learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(3) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText('learning material 3'));
      assert.equal(getElementText(find('.originalauthor', container)), getText('Willie Mays'));
      assert.equal(getElementText(find('.description', container)), getText('3 lm description'));
      assert.equal(getElementText(find('.citation', container)), getText('a citation'));
      assert.equal(getElementText(find('.upload-date', container)), moment().format('M-D-YYYY'));
      assert.equal(find('.copyrightrationale', container).length, 0);
      assert.equal(find('.file', container).length, 0);
      assert.equal(find('.copyrightpermission', container).length, 0);
    });
  });
});

test('edit learning material', function(assert) {
  const searchBox = '.search-box';

  visit(url);
  andThen(function() {
    assert.ok(isPresent(find(searchBox)), 'learner-gorup search box is visible');
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      let container = $('.learningmaterial-manager');
      assert.ok(isEmpty(find(searchBox)), 'learner-gorup search box is hidden while in edit mode');
      click(find('.required .switch-handle', container));
      click(find('.publicnotes .switch-handle', container));
      click(find('.status .editable', container)).then(function(){
        pickOption(find('.status select', container), 'status 2', assert);
        click(find('.status .done', container));
      });
      let newNote = 'text text.  Woo hoo!';
      click(find('.notes .editable', container)).then(function(){
        //wait for the editor to load
        later(()=>{
          find('.notes .fr-box', container).froalaEditor('html.set', newNote);
          find('.notes .fr-box', container).froalaEditor('events.trigger', 'contentChanged');
          click(find('.notes .done', container));
          andThen(function(){
            assert.equal(getElementText(find('.notes', container)), getText(newNote));
          });
          click('.detail-learningmaterials button.bigadd');
          andThen(function(){
            assert.equal(getElementText(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(3)')), getText('Yes'));
            assert.equal(getElementText(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(4)')), getText('Yes'), 'there is content in notes');
            assert.ok(isEmpty(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(4) i')), 'publicNotes is false and `eye` icon is not visible');
            assert.equal(getElementText(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(6)')), getText('status 2'));

            click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(0)');
            andThen(function(){
              container = $('.learningmaterial-manager');
              assert.equal(getElementText(find('.notes', container)), getText(newNote));
              assert.equal(getElementText(find('.status', container)), getText('status 2'));
            });
          });
        }, 100);
      });
    });
  });
});

test('cancel editing learning material', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      click(find('.required .switch-handle', container));
      click(find('.publicnotes .switch-handle', container));
      click(find('.status .editable', container)).then(function(){
        pickOption(find('.status select', container), 'status 2', assert);
        click(find('.status .done', container));
      });
      click('.detail-learningmaterials button.bigcancel');
      andThen(function(){
        assert.equal(getElementText(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(3)')), getText('No'));
        assert.equal(getElementText(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(4)')), getText('No'), 'no content is available under notes');
        assert.ok(isEmpty(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(4) i')), 'publicNotes is true but notes are blank so `eye` icon is not visible');
        assert.equal(getElementText(find('.detail-learningmaterials .detail-learningmaterials-content tbody tr:eq(0) td:eq(6)')), getText('status 0'));
      });
    });
  });
});

test('manage terms', async function(assert) {
  assert.expect(18);
  await visit(url);
  let container = find('.detail-learningmaterials').eq(0);
  await click('.detail-learningmaterials-content tbody tr:eq(0) td:eq(5) .link', container);
  assert.equal(getElementText(find('.specific-title', container)), 'SelectMeSHDescriptorsforLearningMaterials');
  let meshManager = find('.mesh-manager', container).eq(0);
  let removableItems = find('.removable-list li', meshManager);
  assert.equal(removableItems.length, 2);

  assert.equal(getElementText(find('.content .title', removableItems[0]).eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(find('.content .title', removableItems[1]).eq(0)), getText('descriptor 1'));

  let searchBox = find('.search-box', meshManager);
  assert.equal(searchBox.length, 1);
  searchBox = searchBox.eq(0);
  let searchBoxInput = find('input', searchBox);
  assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
  await fillIn(searchBoxInput, 'descriptor');
  await click('span.search-icon', searchBox);

  let searchResults = find('.mesh-search-results li', meshManager);
  assert.equal(searchResults.length, 3);
  assert.equal(getElementText(find('.descriptor-name', searchResults[0]).eq(0)), getText('descriptor 0'));
  assert.equal(getElementText(find('.descriptor-name', searchResults[1]).eq(0)), getText('descriptor 1'));
  assert.equal(getElementText(find('.descriptor-name', searchResults[2]).eq(0)), getText('descriptor 2'));

  assert.ok($(searchResults[0]).hasClass('disabled'), 'is disabled');
  assert.ok($(searchResults[1]).hasClass('disabled'), 'is disabled');
  assert.notOk($(searchResults[2]).hasClass('disabled'), 'is not disabled');

  await click('.removable-list li:eq(0)', meshManager);
  assert.notOk($(find('.mesh-search-results li:eq(0)', meshManager)).hasClass('disabled'), 'is not disabled after being removed');

  await click(searchResults[2]);

  assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'), 'is disabled after being selected');
  removableItems = find('.removable-list li', meshManager);
  assert.equal(removableItems.length, 2);
  assert.equal(getElementText(find('.title', removableItems[0]).eq(0)), getText('descriptor 1'), 'selected items are selected');
  assert.equal(getElementText(find('.title', removableItems[1]).eq(0)), getText('descriptor 2'), 'selected items are selected');
});

test('save terms', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let container = find('.detail-learningmaterials').eq(0);
    click('.detail-learningmaterials-content tbody tr:eq(0) td:eq(5) .link', container);
    andThen(function() {
      let meshManager = find('.mesh-manager', container).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[0]);
        click('button.bigadd', container);
        andThen(function(){
          let expectedMesh = 'descriptor 0 descriptor 1';
          let tds = find('.detail-learningmaterials-content tbody tr:eq(0) td');
          assert.equal(getElementText(tds.eq(5)), getText(expectedMesh));
        });
      });
    });
  });
});

test('cancel term changes', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let container = find('.detail-learningmaterials').eq(0);
    click('.detail-learningmaterials-content tbody tr:eq(0) td:eq(5) .link', container);
    andThen(function() {
      let meshManager = find('.mesh-manager', container).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[0]);
        click(searchResults[2]);
        click('button.bigcancel', container);
        andThen(function(){
          let tds = find('.detail-learningmaterials-content tbody tr:eq(0) td');
          let expectedMesh = 'descriptor 0 descriptor 1';
          assert.equal(getElementText(tds.eq(5)), getText(expectedMesh));
        });
      });
    });
  });
});

test('find and add learning material', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.index');
    let container = find('.detail-learningmaterials');
    let rows = find('.detail-learningmaterials-content tbody tr', container);
    assert.equal(rows.length, 4);

    let searchBoxInput = find('input', container);
    fillIn(searchBoxInput, 'doc');
    triggerEvent(searchBoxInput, 'keyup');
    andThen(function(){
      later(function(){
        let searchResults = find('.lm-search-results > li', container);
        assert.equal(searchResults.length, 1);
        assert.equal(getElementText($('.lm-search-results > li:eq(0) h4')), getText('Letter to Doc Brown'));
        let addlProps = find('.lm-search-results > li:eq(0) .learning-material-properties li', container);
        assert.equal(addlProps.length, 3);
        assert.equal(getElementText($('.lm-search-results > li:eq(0) .learning-material-properties li:eq(0)')),
          getText('Owner: 0 guy M. Mc0son'));
        assert.equal(getElementText($('.lm-search-results > li:eq(0) .learning-material-properties li:eq(1)')),
          getText('Content Author: ' + 'Marty McFly'));
        const learningMaterial4 = server.db.learningMaterials[4];
        assert.equal(getElementText($('.lm-search-results > li:eq(0) .learning-material-properties li:eq(2)')),
          getText('Upload date: ' + moment(learningMaterial4.uploadDate).format('M-D-YYYY')));
        click(searchResults[0]);

        andThen(function(){
          rows = find('.detail-learningmaterials-content tbody tr', container);
          assert.equal(rows.length, 4 + 1);
        });
      }, 1000);
    });
  });
});
