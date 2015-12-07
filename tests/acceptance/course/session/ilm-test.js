import destroyApp from '../../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import {c as testgroup} from 'ilios/tests/helpers/test-groups';

var application;
var fixtures = {};
var url = '/courses/1/sessions/1';
module('Acceptance: Session - Independent Learning' + testgroup, {
  beforeEach: function() {
    application = startApp();
    authenticateSession();
    server.create('user', {
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
    server.create('program', {
      programYears: [1,2]
    });
    server.create('programYear', {
      program: 1,
      cohort: 1,
    });
    server.create('programYear', {
      program: 1,
      cohort: 2,
      objectives: [2]
    });
    fixtures.learnerGroups = [];
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      ilmSession: 1,
    }));

    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      children: [5,6]
    }));
    fixtures.learnerGroups.pushObjects(server.createList('learnerGroup', 2, {
      cohort: 2
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      parent: 2,
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      parent: 2,
      children: [7]
    }));
    fixtures.learnerGroups.pushObject(server.create('learnerGroup', {
      cohort: 1,
      parent: 6,
    }));
    fixtures.cohorts = [];
    fixtures.cohorts.pushObject(server.create('cohort', {
      courses: [1],
      programYear: 1,
      learnerGroups: [1,2,3,5]
    }));
    fixtures.cohorts.pushObject(server.create('cohort', {
      programYear: 2,
      learnerGroups: [4,5]
    }));
    fixtures.course = server.create('course', {
      cohorts: [1,2],
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
      learnerGroups: [1],
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

test('initial selected learner groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    var selectedGroups = find('.inline-list li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.learnerGroups.length);
    for(let i = 0; i < fixtures.ilmSession.learnerGroups.length; i++){
      let expectedTitle = getText(fixtures.learnerGroups[fixtures.ilmSession.learnerGroups[i] - 1].title);
      let title = getElementText(selectedGroups.eq(i));
      assert.equal(title, expectedTitle);
    }
  });
});

test('check learner groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container);
    andThen(function(){
      var cohorts = find('.selectable-list li.static');
      assert.equal(cohorts.length, fixtures.course.cohorts.length);
      assert.equal(getElementText(cohorts.eq(0)), getText('cohort0 learnergroup1 learnergroup1 learnergroup4 learnergroup1 learnergroup5 learnergroup1 learnergroup5 learnergroup6'));
    });

  });
});

test('filter learner groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container);
    andThen(function(){
      fillIn(find('input', container), 'group 5').then(function(){
        assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1 learnergroup5learnergroup1 learnergroup5 learnergroup6'));
      });
    });
  });
});

test('add learner group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container).then(function(){
      click('.selectable-list ul li.static:eq(1) ul li:eq(0)', container);
    });
    andThen(function(){
      assert.equal(getElementText(find('.removable-list', container)), 'learnergroup0learnergroup2');
      assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1learnergroup1 learnergroup4learnergroup1 learnergroup5learnergroup1 learnergroup5 learnergroup6'));
      assert.equal(getElementText(find('.selectable-list li.static').eq(1)), getText('cohort1learnergroup3'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0learnergroup2');
    });
  });
});

test('add learner sub group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container).then(function(){
      click('.selectable-list ul li.static:eq(0) ul li:eq(1)', container);
    });
    andThen(function(){
      assert.equal(getElementText(find('.removable-list', container)), getText('learnergroup0 learnergroup1 learnergroup4'));
      assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1learnergroup1 learnergroup5learnergroup1 learnergroup5 learnergroup6'));
      assert.equal(getElementText(find('.selectable-list li.static').eq(1)), getText('cohort1learnergroup2learnergroup3'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), getText('learnergroup0 learnergroup1 learnergroup4'));
    });
  });
});

test('add learner group with children', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container);
    andThen(function(){
      click('.selectable-list ul li.static:eq(0) ul li:eq(0)', container);
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), getText('learnergroup0 learnergroup1 learnergroup1 learnergroup4 learnergroup1 learnergroup5 learnergroup1 learnergroup5 learnergroup6'));
    });
  });
});

test('add learner group with children and remove one child', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container);
    andThen(function(){
      click('.selectable-list ul li.static:eq(0) ul li:eq(0)', container);
      click('.removable-list li:eq(2)', container);
      andThen(function(){
        assert.equal(getElementText(find('.removable-list', container)), getText('learnergroup0 learnergroup1 learnergroup1 learnergroup5 learnergroup1 learnergroup5 learnergroup6'));
        assert.equal(getElementText(find('.selectable-list li.static').eq(0)), getText('cohort0learnergroup1 learnergroup4'));
        click('.bigadd', container);
      });
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), getText('learnergroup0 learnergroup1 learnergroup1 learnergroup5 learnergroup1 learnergroup5 learnergroup6'));
    });
  });
});

test('remove learner group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container);
    andThen(function(){
      click('.removable-list li:eq(0)', container);
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(selectedGroups.length, 0);
    });
  });
});

test('undo learner group change', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-learnergroups');
    click('.detail-actions button', container);
    andThen(function(){
      click('.selectable-list ul li ul li:eq(0)', container);
      click('.removable-list li:eq(0)', container);
      click('.bigcancel', container);
    });
    andThen(function(){
      var selectedGroups = find('.inline-list li', container);
      assert.equal(getElementText(selectedGroups), 'learnergroup0');
    });
  });
});

test('initial selected instructors', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    assert.equal(getElementText(find('.detail-title', container)), getText('Instructors(6)'));
    var selectedGroups = find('.columnar-list:eq(0) li', container);
    assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
    for(let i = 0; i < fixtures.ilmSession.instructorGroups.length; i++){
      let expectedTitle = getText(fixtures.instructorGroups[fixtures.ilmSession.instructorGroups[i] - 1].title);
      let title = getElementText(selectedGroups.eq(i));
      assert.equal(title, expectedTitle);
    }

    var selectedUsers = find('.columnar-list:eq(1) li', container);
    assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
    assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
  });
});

test('manage instructors lists', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container);
    andThen(function(){
      var selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

      var selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
      assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
    });
  });
});

test('manage instructors search users', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container);
    andThen(function(){
      let searchBox = find('.search-box', container);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Find Instructor or Group');
      fillIn(searchBoxInput, 'guy');
      click('span.search-icon', searchBox).then(()=>{
        let searchResults = find('.live-search .results li', container);
        assert.equal(searchResults.length, 7);
        let expectedResults = '0 guy M. Mc0son 1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son 5 guy M. Mc5son 6 guy M. Mc6son';
        assert.equal(getElementText(searchResults), getText(expectedResults));

        let activeResults = find('.live-search .results li.active', container);
        assert.equal(getElementText(activeResults), getText('0 guy M. Mc0son 4 guy M. Mc4son 5 guy M. Mc5son 6 guy M. Mc6son'));

        let inActiveResults = find('.live-search .results li.inactive', container);
        assert.equal(getElementText(inActiveResults), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});


test('manage instructors search groups', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container);
    andThen(function(){
      let searchBox = find('.search-box', container);
      assert.equal(searchBox.length, 1);
      searchBox = searchBox.eq(0);
      let searchBoxInput = find('input', searchBox);
      assert.equal(searchBoxInput.attr('placeholder'), 'Find Instructor or Group');
      fillIn(searchBoxInput, 'group');
      click('span.search-icon', searchBox).then(()=>{
        let searchResults = find('.live-search .results li', container);
        assert.equal(searchResults.length, 5);
        let expectedResults = 'instructorgroup 0 instructorgroup 1 instructorgroup 2 instructorgroup 3 instructorgroup 4';
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
    click('.detail-actions button', container).then(function(){
      let input = find('.search-box input', container);
      fillIn(input, 'group');
      click('span.search-icon', container).then(()=>{
        click('.live-search .results li:eq(3)');
      });
    });
    andThen(function(){
      let selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 4);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));

      let selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, fixtures.ilmSession.instructors.length);
      assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
      click('.bigadd', container);
      andThen(function(){
        let selectedGroups = find('.columnar-list:eq(0) li', container);
        assert.equal(selectedGroups.length, 4);
        assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2 instructor group 3'));

        let selectedUsers = find('.columnar-list:eq(1) li', container);
        assert.equal(selectedUsers.length, 3);
        assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});

test('add instructor', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container).then(function(){
      let input = find('.search-box input', container);
      fillIn(input, 'guy');
      click('span.search-icon', container).then(()=>{
        click('.live-search .results li:eq(4)');
      });
    });
    andThen(function(){
      var selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, fixtures.ilmSession.instructorGroups.length);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

      var selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 4);
      assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son'));
      click('.bigadd', container);
    });
    andThen(function(){
      var selectedGroups = find('.columnar-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 3);
      assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

      var selectedUsers = find('.columnar-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 4);
      assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son 4 guy M. Mc4son'));
    });
  });
});

test('remove instructor group', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container).then(function(){
      click('.removable-list:eq(0) li:eq(0)', container);
    });
    andThen(function(){
      let selectedGroups = find('.removable-list:eq(0) li', container);
      assert.equal(selectedGroups.length, 2);
      assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));

      let selectedUsers = find('.removable-list:eq(1) li', container);
      assert.equal(selectedUsers.length, 3);
      assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
      click('.bigadd', container);
      andThen(function(){
        let selectedGroups = find('.columnar-list:eq(0) li', container);
        assert.equal(selectedGroups.length, 2);
        assert.equal(getElementText(selectedGroups), getText('instructor group 1 instructor group 2'));

        let selectedUsers = find('.columnar-list:eq(1) li', container);
        assert.equal(selectedUsers.length, 3);
        assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});

test('remove instructor', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container).then(function(){
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
        let selectedGroups = find('.columnar-list:eq(0) li', container);
        assert.equal(selectedGroups.length, 3);
        assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

        let selectedUsers = find('.columnar-list:eq(1) li', container);
        assert.equal(selectedUsers.length, 2);
        assert.equal(getElementText(selectedUsers), getText('2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});

test('undo instructor/group changes', function(assert) {
  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'course.session.index');
    var container = find('.detail-instructors');
    click('.detail-actions button', container).then(function(){
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
        let selectedGroups = find('.columnar-list:eq(0) li', container);
        assert.equal(selectedGroups.length, 3);
        assert.equal(getElementText(selectedGroups), getText('instructor group 0 instructor group 1 instructor group 2'));

        let selectedUsers = find('.columnar-list:eq(1) li', container);
        assert.equal(selectedUsers.length, 3);
        assert.equal(getElementText(selectedUsers), getText('1 guy M. Mc1son 2 guy M. Mc2son 3 guy M. Mc3son'));
      });
    });
  });
});
