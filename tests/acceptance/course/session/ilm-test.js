import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Independent Learning', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application, {
      id: 4136,
      school: 1
    });
    server.createList('user', 3, {
      instructorIlmSessions: [1]
    });
    server.createList('user', 3);
    fixtures.school = server.create('school', {
      instructorGroups: [1,2,3,4,5],
      courses: [1]
    });
    server.create('academicYear');
    fixtures.course = server.create('course', {
      school: 1
    });

    fixtures.instructorGroups = [];
    fixtures.instructorGroups.pushObjects(server.createList('instructorGroup', 3,{
      ilmSession: 1,
      school: 1
    }));
    fixtures.instructorGroups.pushObjects(server.createList('instructorGroup', 2,{
      school: 1
    }));
    fixtures.sessionType = server.create('sessionType');
    fixtures.sessionDescription = server.create('sessionDescription');
    fixtures.ilmSession = server.create('ilmSession', {
      session: 1,
      instructorGroups: [1,2,3],
      instructors: [2,3,4]
    });
    fixtures.session = server.create('session', {
      course: 1,
      ilmSession: 1
    });
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('initial selected instructors', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    assert.equal(getElementText(find('.title', container)), getText('Instructors(6)'));
    var selectedGroups = find('.columnar-list:eq(0) li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
    for(let i = 0; i < fixtures.ilmSession.instructorGroups.length; i++){
      let expectedTitle = getText(fixtures.instructorGroups[fixtures.ilmSession.instructorGroups[i] - 1].title);
      let title = getElementText(selectedGroups.eq(i));
      assert.equal(title, expectedTitle);
    }

    var selectedUsers = find('.columnar-list:eq(1) li', container);
    assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
    assert.equal(getElementText(selectedUsers), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });
});

test('manage instructors lists', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container);
    andThen(function(){
      var selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

      var selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
      assert.equal(getElementText(selectedUsers), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
    });
  });
});

test('manage instructors search users', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container);
    andThen(function(){
      let searchBox = find('.search-box', container);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Find Instructor or Group');
      fillIn(searchBoxInput, 'guy');
      click('span.search-icon', searchBox).then(()=>{
        let searchResults = find('.live-search .results li', container);
        assert.equal(searchResults.length, 8);
        let expectedResults = '7 Results 0 guy M. Mc0son 4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son 5 guy M. Mc5son 6 guy M. Mc6son';
        assert.equal(getElementText(searchResults), getText(expectedResults));

        let activeResults = find('.live-search .results li.active', container);
        assert.equal(getElementText(activeResults), getText('0 guy M. Mc0son 1 guy M. Mc1son 5 guy M. Mc5son 6 guy M. Mc6son'));

        let inActiveResults = find('.live-search .results li.inactive', container);
        assert.equal(getElementText(inActiveResults), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});


test('manage instructors search groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container);
    andThen(function(){
      let searchBox = find('.search-box', container);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Find Instructor or Group');
      fillIn(searchBoxInput, 'group');
      click('span.search-icon', searchBox).then(()=>{
        let searchResults = find('.live-search .results li', container);
        assert.equal(searchResults.length, 6);
        let expectedResults = '5 Results instructorgroup 0 instructorgroup 1 instructorgroup 2 instructorgroup 3 instructorgroup 4';
        assert.equal(getElementText(searchResults), getText(expectedResults));

        let activeResults = find('.live-search .results li.active', container);
        assert.equal(getElementText(activeResults), getText('instructorgroup 3 instructorgroup 4'));

        let inActiveResults = find('.live-search .results li.inactive', container);
        assert.equal(getElementText(inActiveResults), getText('instructorgroup 0 instructorgroup 1 instructorgroup 2'));
      });
    });
  });
});

test('add instructor group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container).then(function(){
      let input = find('.search-box input', container);
      fillIn(input, 'group');
      click('span.search-icon', container).then(()=>{
        click('.live-search .results li:eq(4)');
      });
    });
    andThen(function(){
      let selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 4);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3', 'instuctor group count'));

      let selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
      assert.equal(getElementText(selectedUsers), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
      click('.bigadd', container);
      andThen(function(){
        let groups = find('.columnar-list:eq(0) li', container);
        assert.equal(groups.length, 4);
        assert.equal(getElementText(groups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));

        let users = find('.columnar-list:eq(1) li', container);
        assert.equal(users.length, 3);
        assert.equal(getElementText(users), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});

test('add instructor', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container).then(function(){
      let input = find('.search-box input', container);
      fillIn(input, 'guy');
      click('span.search-icon', container).then(()=>{
        click('.live-search .results li:eq(5)');
      });
    });
    andThen(function(){
      var selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length, 'groups length test');
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'), 'instructor groups text');

      var selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 4, 'removable list count');
      assert.equal(getElementText(selectedUsers), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.columnar-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 3);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

      var selectedUsers = find('.columnar-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 4);
      assert.equal(getElementText(selectedUsers), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son'));
    });
  });
});

test('remove instructor group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container).then(function(){
      click('.removable-list:eq(0) li:eq(0)', container);
    });
    andThen(function(){
      let selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 2);
      assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));

      let selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 3);
      assert.equal(getElementText(selectedUsers), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
      click('.bigadd', container);
      andThen(function(){
        let groups = find('.columnar-list:eq(0) li', container);
        assert.equal(groups.length, 2);
        assert.equal(getElementText(groups), getText('instructor group 1 instructor group 2'));

        let users = find('.columnar-list:eq(1) li', container);
        assert.equal(users.length, 3);
        assert.equal(getElementText(users), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});

test('remove instructor', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container).then(function(){
      click('.removable-list:eq(1) li:eq(0)', container);
    });
    andThen(function(){
      let selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 3);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

      let selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 2);
      assert.equal(getElementText(selectedUsers), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
      click('.bigadd', container);
      andThen(function(){
        let groups = find('.columnar-list:eq(0) li', container);
        assert.equal(groups.length, 3);
        assert.equal(getElementText(groups), getText('instructor group 0 instructor group 1 instructor group 2'));

        let users = find('.columnar-list:eq(1) li', container);
        assert.equal(users.length, 2);
        assert.equal(getElementText(users), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});

test('undo instructor/group changes', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.actions button', container).then(function(){
      click('.removable-list:eq(0) li:eq(0)', container);
      click('.removable-list:eq(1) li:eq(0)', container);
    });
    andThen(function(){
      let selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 2);
      assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));

      let selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 2);
      assert.equal(getElementText(selectedUsers), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
      click('.bigcancel', container);
      andThen(function(){
        let groups = find('.columnar-list:eq(0) li', container);
        assert.equal(groups.length, 3);
        assert.equal(getElementText(groups), getText('instructor group 0 instructor group 1 instructor group 2'));

        let users = find('.columnar-list:eq(1) li', container);
        assert.equal(users.length, 3);
        assert.equal(getElementText(users), getText('4 guy M. Mc4son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});
