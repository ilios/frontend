import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import Ember from 'ember';

const { isEmpty, isPresent, run } = Ember;
const { later } = run;

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Learning Materials' + testgroup, {
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
      sessionLearningMaterials: [1],
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
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Hunter Pence',
      link: 'www.example.com',
      status: 1,
      owningUser: 4136,
      userRole: 1,
      copyrightPermission: true,
      sessionLearningMaterials: [3],
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      originalAuthor: 'Willie Mays',
      citation: 'a citation',
      status: 1,
      owningUser: 4136,
      userRole: 1,
      copyrightPermission: true,
      sessionLearningMaterials: [4],
    }));
    fixtures.learningMaterials.pushObject(server.create('learningMaterial',{
      title: 'Letter to Doc Brown',
      originalAuthor: 'Marty McFly',
      owningUser: 4136,
      status: 1,
      userRole: 1,
      copyrightPermission: true,
      courseLearningMaterials: [],
    }));
    fixtures.sessionLearningMaterials = [];
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 1,
      session: 1,
      required: false,
      meshDescriptors: [2,3]
    }));
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 2,
      session: 1,
      required: false,
    }));
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 3,
      session: 1,
      publicNotes: false,
    }));
    fixtures.sessionLearningMaterials.pushObject(server.create('sessionLearningMaterial',{
      learningMaterial: 4,
      session: 1,
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

test('list learning materials', function(assert) {
  visit(url);
  andThen(function() {
	const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
	const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
    assert.equal(currentPath(), 'course.session.index');
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.session.learningMaterials.length);
    for (let i = 0; i < fixtures.session.learningMaterials.length; i++){
      let row = rows.eq(i);
      let sessionLm = fixtures.sessionLearningMaterials[fixtures.session.learningMaterials[i] - 1];
      let lm = fixtures.learningMaterials[sessionLm.learningMaterial - 1];
      assert.equal(getElementText(find('td:eq(0)', row)), getText(lm.title));
      //TODO: we are no longer populating for 'type', so we need to pull all these tests out
      //of the loop and test each fixture individually
      //assert.equal(getElementText(find('td:eq(1)', row)), getText(lm.type));
      let required = sessionLm.required?'Yes':'No';
      assert.equal(getElementText(find('td:eq(2)', row)), getText(userName));
      assert.equal(getElementText(find('td:eq(3)', row)), getText(required));
      let notes = sessionLm.notes? 'Yes' : 'No';
      assert.equal(getElementText(find('td:eq(4)', row)), getText(notes));
      let notesBool = sessionLm.notes? true : false;
      let publicNotes = sessionLm.publicNotes ? true : false;
      assert.equal(find('td:eq(4) i', row).hasClass('fa-eye'), publicNotes && notesBool);
      let meshTerms = find('td:eq(5) li', row);
      if('meshDescriptors' in sessionLm){
        assert.equal(meshTerms.length, sessionLm.meshDescriptors.length);
        for(let i = 0; i < sessionLm.meshDescriptors.length; i++){
          assert.equal(getElementText(meshTerms.eq(i)), getText(fixtures.meshDescriptors[sessionLm.meshDescriptors[i] - 1].name));
        }
      }
    }
  });
});

//we can't upload a file so we cant run this test
// test('create new file learning material', function(assert) {
//   const testTitle = 'testsome title';
//   const testAuthor = 'testsome author';
//   const testDescription = 'testsome description';
//   const searchBox = '.search-input';
// 
//   visit(url);
//   andThen(function() {
//     let container = find('.detail-learning-materials');
//     let rows = find('.detail-content tbody tr', container);
// 
//     assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
//     assert.equal(rows.length, fixtures.session.learningMaterials.length);
//     click('.detail-actions-absolute .button', container).then(function(){
//       //pick the file type
//       click('.detail-actions-absolute ul li:eq(0)');
//     });
//   });
//   andThen(function(){
//     assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
//     //check that we got the right form
//     let labels = find('.detail-learning-materials .new-learning-material label');
//     assert.equal(labels.length, 9);
//     const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
//     const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
//     assert.equal(getElementText(find('.detail-learning-materials .new-learning-material .owninguser')), getText(userName));
//     let newLmContainer = find('.detail-learning-materials .new-learning-material');
//     let inputs = find('input', newLmContainer);
//     let selectBoxes = find('select', newLmContainer);
//     fillIn(inputs.eq(0), testTitle);
//     fillIn(inputs.eq(1), testAuthor);
//     pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
//     pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
//     find('.froala-box', newLmContainer).editable('setHTML', testDescription);
//     click('.detail-learning-materials .new-learning-material .done');
//     andThen(function(){
//         // return pauseTest();
//       let container = find('.detail-learning-materials');
//       let rows = find('.detail-content tbody tr', container);
//       assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
//       let row = rows.eq(fixtures.session.learningMaterials.length);
//       assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
//       assert.equal(getElementText(find('td:eq(1)', row)), getText('file'));
//     });
//   });
// });

test('create new link learning material', function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const testUrl = 'http://www.ucsf.edu/';
  const searchBox = '.search-input';

  visit(url);
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);

    assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
    assert.equal(rows.length, fixtures.session.learningMaterials.length);
    click('.detail-actions-absolute .button', container).then(function(){
      //pick the link type
      click('.detail-actions-absolute ul li:eq(1)');
    });
  });
  andThen(function(){
    assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
    //check that we got the right form
    let labels = find('.detail-learning-materials .new-learning-material label');
    assert.equal(labels.length, 7);
    const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
    const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
    assert.equal(getElementText(find('.detail-learning-materials .new-learning-material .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .new-learning-material');
    let inputs = find('input', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    fillIn(inputs.eq(2), testUrl);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    find('.froala-box', newLmContainer).editable('setHTML', testDescription);
    click('.detail-learning-materials .new-learning-material .done');
    andThen(function(){
      let container = find('.detail-learning-materials');
      let rows = find('.detail-content tbody tr', container);
      assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
      let row = rows.eq(fixtures.session.learningMaterials.length);
      assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
      assert.equal(getElementText(find('td:eq(1)', row)), getText('link'));
    });
  });
});

test('create new citation learning material', function(assert) {
  const testTitle = 'testsome title';
  const testAuthor = 'testsome author';
  const testDescription = 'testsome description';
  const searchBox = '.search-input';

  visit(url);
  andThen(function() {
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);

    assert.ok(isPresent(find(searchBox)), 'learner-group search box is visible');
    assert.equal(rows.length, fixtures.session.learningMaterials.length);
    click('.detail-actions-absolute .button', container).then(function(){
      //pick the citation type
      click('.detail-actions-absolute ul li:eq(2)');
    });
  });
  andThen(function(){
    assert.ok(isEmpty(find(searchBox)), 'learner-group search box is hidden while new group are being added');
    //check that we got the right form
    let labels = find('.detail-learning-materials .new-learning-material label');
    assert.equal(labels.length, 7);
    const middleInitial = fixtures.user.middleName.charAt(0).toUpperCase();
    const userName = `${fixtures.user.firstName} ${middleInitial}. ${fixtures.user.lastName}`;
    assert.equal(getElementText(find('.detail-learning-materials .new-learning-material .owninguser')), getText(userName));
    let newLmContainer = find('.detail-learning-materials .new-learning-material');
    let inputs = find('input', newLmContainer);
    let selectBoxes = find('select', newLmContainer);
    fillIn(inputs.eq(0), testTitle);
    fillIn(inputs.eq(1), testAuthor);
    pickOption(selectBoxes[0], fixtures.statuses[2].title, assert);
    pickOption(selectBoxes[1], fixtures.roles[2].title, assert);
    find('.froala-box', newLmContainer).editable('setHTML', testDescription);
    click('.detail-learning-materials .new-learning-material .done');
    andThen(function(){
      let container = find('.detail-learning-materials');
      let rows = find('.detail-content tbody tr', container);
      assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
      let row = rows.eq(fixtures.session.learningMaterials.length);
      assert.equal(getElementText(find('td:eq(0)', row)), getText(testTitle));
      assert.equal(getElementText(find('td:eq(1)', row)), getText('citation'));
    });
  });
});

test('can only add one learning-material at a time', function(assert) {
  const addButton = '.detail-actions-absolute .button';
  const fileButton = '.detail-actions-absolute ul li:eq(0)';
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
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.session.learningMaterials.length);
    click('.detail-actions-absolute .button', container);
    click('.detail-actions-absolute ul li:eq(0)');
  });
  andThen(function(){
    click('.detail-learning-materials .new-learning-material .cancel');
  });
  andThen(function(){
    let rows = find('.detail-learning-materials .detail-content tbody tr');
    assert.equal(rows.length, fixtures.session.learningMaterials.length);
  });

});

test('view copyright file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[0].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[0].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[0].description));
      assert.equal(getElementText(find('.copyrightpermission', container)), getText('Yes'));
      assert.equal(find('.copyrightrationale', container).length, 0);
    });
  });
});

test('view rationale file learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(1) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[1].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[1].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[1].description));
      assert.equal(getElementText(find('.copyrightrationale', container)), getText(fixtures.learningMaterials[1].copyrightRationale));
      assert.equal(find('.citation', container).length, 0);
      assert.equal(find('.link', container).length, 0);
    });
  });
});

test('view link learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(2) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[2].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[2].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[2].description));
      assert.equal(getElementText(find('.link', container)), getText(fixtures.learningMaterials[2].link));
      assert.equal(find('.copyrightpermission', container).length, 1);
      assert.equal(find('.copyrightrationale', container).length, 0);
      assert.equal(find('.citation', container).length, 0);
    });
  });
});

test('view citation learning material details', function(assert) {
  visit(url);
  andThen(function() {
    click('.detail-learning-materials .detail-content tbody tr:eq(3) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      assert.equal(getElementText(find('.displayname', container)), getText(fixtures.learningMaterials[3].title));
      assert.equal(getElementText(find('.originalauthor', container)), getText(fixtures.learningMaterials[3].originalAuthor));
      assert.equal(getElementText(find('.description', container)), getText(fixtures.learningMaterials[3].description));
      assert.equal(getElementText(find('.citation', container)), getText(fixtures.learningMaterials[3].citation));
      assert.equal(find('.copyrightpermission', container).length, 1);
      assert.equal(find('.copyrightrationale', container).length, 0);
      assert.equal(find('.file', container).length, 0);
    });
  });
});

test('edit learning material', function(assert) {
  const searchBox = '.search-input';

  visit(url);
  andThen(function() {
    assert.ok(isPresent(find(searchBox)), 'learner-gorup search box is visible');
    click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      let container = $('.learningmaterial-manager');
      assert.ok(isEmpty(find(searchBox)), 'learner-gorup search box is hidden while in edit mode');
      click(find('.required input', container));
      click(find('.publicnotes input', container));
      click(find('.status .editable', container)).then(function(){
        pickOption(find('.status select', container), fixtures.statuses[2].title, assert);
        click(find('.status .done', container));
      });
      let newNote = 'text text.  Woo hoo!';
      click(find('.notes .editable span', container)).then(function(){
        //wait for the editor to load
        Ember.run.later(()=>{
          find('.notes .froala-box', container).editable('setHTML', newNote);
          click(find('.notes .done', container));
          andThen(function(){
            assert.equal(getElementText(find('.notes', container)), getText(newNote));
          });
          click('.detail-learning-materials button.bigadd');
          andThen(function(){
            assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(3)')), getText('Yes'));
            assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(4)')), getText('Yes'), 'there is content in notes');
            assert.ok(isEmpty(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(4) i')), 'publicNotes is false and `eye` icon is not visible');
            assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(6)')), getText(fixtures.statuses[2].title));

            click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
            andThen(function(){
              let container = $('.learningmaterial-manager');
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
    click('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(0)');
    andThen(function(){
      var container = $('.learningmaterial-manager');
      click(find('.required input', container));
      click(find('.publicnotes input', container));
      click(find('.status .editable', container)).then(function(){
        pickOption(find('.status select', container), fixtures.statuses[2].title, assert);
        click(find('.status .done', container));
      });
      click('.detail-learning-materials button.bigcancel');
      andThen(function(){
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(3)')), getText('No'));
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(4)')), getText('No'), 'no content is available under notes');
        assert.ok(isEmpty(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(4) i')), 'publicNotes is true but notes are blank so `eye` icon is not visible');
        assert.equal(getElementText(find('.detail-learning-materials .detail-content tbody tr:eq(0) td:eq(6)')), getText(fixtures.statuses[0].title));
      });
    });
  });
});

test('manage terms', function(assert) {
  assert.expect(24);
  visit(url);
  andThen(function() {
    let container = find('.detail-learning-materials').eq(0);
    click('.detail-content tbody tr:eq(0) td:eq(5) .link', container).then(function(){
      assert.equal(getElementText(find('.detail-specific-title', container)), 'SelectMeSHDescriptorsforLearningMaterials');
    });

    andThen(function() {
      let meshManager = find('.mesh-manager', container).eq(0);
      let material = fixtures.sessionLearningMaterials[0];
      let removableItems = find('.removable-list li', meshManager);
      assert.equal(removableItems.length, material.meshDescriptors.length);
      for (let i = 0; i < material.meshDescriptors.length; i++){
        let meshDescriptionName = find('.content .descriptor-name', removableItems[i]).eq(0);
        assert.equal(getElementText(meshDescriptionName), getText(fixtures.meshDescriptors[material.meshDescriptors[i] - 1].name));
      }

      let searchBox = find('.search-box', meshManager);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Search MeSH');
      fillIn(searchBoxInput, 'descriptor');
      click('span.search-icon', searchBox);
      andThen(function(){
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
        click('.removable-list li:eq(0)', meshManager).then(function(){
          assert.ok(!$(find('.mesh-search-results li:eq(1)', meshManager)).hasClass('disabled'));
        });
        click(searchResults[0]);
        andThen(function(){
          assert.ok($(find('.mesh-search-results li:eq(2)', meshManager)).hasClass('disabled'));

          let newExpectedMesh = [
            fixtures.meshDescriptors[0],
            fixtures.meshDescriptors[2]
          ];
          removableItems = find('.removable-list li', meshManager);
          assert.equal(removableItems.length, 2);
          for (let i = 0; i < 2; i++){
            let meshDescriptorName = find('.descriptor-name', removableItems[i]).eq(0);
            assert.equal(getElementText(meshDescriptorName), getText(newExpectedMesh[i].name));
          }
        });
      });
    });
  });
});

test('save terms', function(assert) {
  assert.expect(1);
  visit(url);
  andThen(function() {
    let container = find('.detail-learning-materials').eq(0);
    click('.detail-content tbody tr:eq(0) td:eq(5) .link', container);
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
          let expectedMesh = fixtures.meshDescriptors[0].name + fixtures.meshDescriptors[2].name;
          let tds = find('.detail-content tbody tr:eq(0) td');
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
    let container = find('.detail-learning-materials').eq(0);
    click('.detail-content tbody tr:eq(0) td:eq(5) .link', container);
    andThen(function() {
      let meshManager = find('.mesh-manager', container).eq(0);
      let searchBoxInput = find('.search-box input', meshManager);
      fillIn(searchBoxInput, 'descriptor');
      click('.search-box span.search-icon', meshManager);
      andThen(function(){
        let searchResults = find('.mesh-search-results li', meshManager);
        click('.removable-list li:eq(0)', meshManager);
        click(searchResults[2]);
        click(searchResults[3]);
        click(searchResults[4]);
        click('button.bigcancel', container);
        andThen(function(){
          let tds = find('.detail-content tbody tr:eq(0) td');
          let expectedMesh = fixtures.meshDescriptors[1].name + fixtures.meshDescriptors[2].name;
          assert.equal(getElementText(tds.eq(5)), getText(expectedMesh));
        });
      });
    });
  });
});

test('find and add learning material', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    let container = find('.detail-learning-materials');
    let rows = find('.detail-content tbody tr', container);
    assert.equal(rows.length, fixtures.session.learningMaterials.length);

    let searchBoxInput = find('input', container);
    fillIn(searchBoxInput, 'doc');
    triggerEvent(searchBoxInput, 'search');
    andThen(function(){
      later(function(){
        let searchResults = find('.results li', container);
        assert.equal(searchResults.length, 1);
        assert.equal(getElementText($('.results li:eq(0) h4')), getText('Letter to Doc Brown'));
        click(searchResults[0]);

        andThen(function(){
          let rows = find('.detail-content tbody tr', container);
          assert.equal(rows.length, fixtures.session.learningMaterials.length + 1);
        });
      }, 1000);
    });
  });
});
