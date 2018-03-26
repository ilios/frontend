import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import moment from 'moment';
import { currentRouteName } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import page from 'ilios/tests/pages/session';

const today = moment();

module('Acceptance: Session - Learning Materials', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.server.create('academicYear');
    this.server.create('learningMaterialStatus', {
      learningMaterialIds: [1]
    });
    this.server.createList('learningMaterialStatus', 5);
    this.server.createList('learningMaterialUserRole', 3);
    this.server.createList('meshDescriptor', 6);
  });
  module('Single Linked Materials', function (hooks) {
    hooks.beforeEach(function () {
      this.server.create('learningMaterial', {
        originalAuthor: 'Jennifer Johnson',
        owningUserId: this.user.id,
        statusId: 1,
        userRoleId: 1,
        copyrightPermission: true,
        filename: 'something.pdf',
        absoluteFileUri: 'http://somethingsomething.com/something.pdf',
        uploadDate: moment('2015-02-12').toDate(),
      });
      this.server.create('learningMaterial', {
        originalAuthor: 'Jennifer Johnson',
        owningUserId: this.user.id,
        statusId: 1,
        userRoleId: 1,
        copyrightPermission: false,
        copyrightRationale: 'reason is thus',
        filename: 'filename',
        absoluteFileUri: 'http://example.com/file',
        uploadDate: moment('2011-03-14').toDate(),
      });
      this.server.create('learningMaterial', {
        originalAuthor: 'Hunter Pence',
        link: 'www.example.com',
        statusId: 1,
        owningUserId: this.user.id,
        userRoleId: 1,
        uploadDate: today.toDate(),
      });
      this.server.create('learningMaterial', {
        originalAuthor: 'Willie Mays',
        citation: 'a citation',
        statusId: 1,
        userRoleId: 1,
        owningUserId: this.user.id,
        uploadDate: moment('2016-12-12').toDate(),
      });
      this.server.create('learningMaterial', {
        title: 'Letter to Doc Brown',
        originalAuthor: 'Marty McFly',
        owningUserId: this.user.id,
        statusId: 1,
        userRoleId: 1,
        copyrightPermission: true,
        uploadDate: moment('2016-03-03').toDate(),
        filename: 'letter.txt',
        absoluteFileUri: 'http://bttf.com/letter.txt'
      });
      const course = this.server.create('course', {
        year: 2013,
        school: this.school,
      });
      const session = this.server.create('session', {
        course,
      });
      this.server.create('sessionLearningMaterial', {
        learningMaterialId: 1,
        session,
        required: false,
        meshDescriptorIds: [2, 3],
        position: 0,
      });
      this.server.create('sessionLearningMaterial', {
        learningMaterialId: 2,
        session,
        required: false,
        position: 1,
      });
      this.server.create('sessionLearningMaterial', {
        learningMaterialId: 3,
        session,
        publicNotes: false,
        position: 2,
      });
      this.server.create('sessionLearningMaterial', {
        learningMaterialId: 4,
        session,
        position: 3,
        notes: 'test notes',
      });
    });

    test('list learning materials', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(currentRouteName(), 'session.index');

      assert.equal(page.learningMaterials.current().count, 4);

      assert.equal(page.learningMaterials.current(0).title, 'learning material 0');
      assert.equal(page.learningMaterials.current(0).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(0).required, 'No');
      assert.equal(page.learningMaterials.current(0).notes, 'No');
      assert.notOk(page.learningMaterials.current(0).isNotePublic);
      assert.equal(page.learningMaterials.current(0).mesh, 'descriptor 1 descriptor 2');
      assert.equal(page.learningMaterials.current(0).status, 'status 0');

      assert.equal(page.learningMaterials.current(1).title, 'learning material 1');
      assert.equal(page.learningMaterials.current(1).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(1).required, 'No');
      assert.equal(page.learningMaterials.current(1).notes, 'No');
      assert.notOk(page.learningMaterials.current(1).isNotePublic);
      assert.equal(page.learningMaterials.current(1).mesh, 'None');
      assert.equal(page.learningMaterials.current(1).status, 'status 0');
      assert.equal(page.learningMaterials.current(1).status, 'status 0');

      assert.equal(page.learningMaterials.current(2).title, 'learning material 2');
      assert.equal(page.learningMaterials.current(2).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(2).required, 'Yes');
      assert.equal(page.learningMaterials.current(2).notes, 'No');
      assert.notOk(page.learningMaterials.current(2).isNotePublic);
      assert.equal(page.learningMaterials.current(2).mesh, 'None');
      assert.equal(page.learningMaterials.current(2).status, 'status 0');
      assert.equal(page.learningMaterials.current(2).status, 'status 0');

      assert.equal(page.learningMaterials.current(3).title, 'learning material 3');
      assert.equal(page.learningMaterials.current(3).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(3).required, 'Yes');
      assert.equal(page.learningMaterials.current(3).notes, 'Yes');
      assert.ok(page.learningMaterials.current(3).isNotePublic);
      assert.equal(page.learningMaterials.current(3).mesh, 'None');
      assert.equal(page.learningMaterials.current(3).status, 'status 0');
    });

    test('create new link learning material', async function (assert) {
      const testTitle = 'testsome title';
      const testAuthor = 'testsome author';
      const testDescription = 'testsome description';
      const testUrl = 'http://www.ucsf.edu/';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      assert.ok(page.learningMaterials.canSearch);
      await page.learningMaterials.createNew();
      await page.learningMaterials.pickNew('Web Link');
      assert.notOk(page.learningMaterials.canSearch, 'search box is hidden while new group are being added');

      await page.learningMaterials.newLearningMaterial.name(testTitle);
      assert.equal(page.learningMaterials.newLearningMaterial.userName, '0 guy M. Mc0son');
      await page.learningMaterials.newLearningMaterial.author(testAuthor);
      await page.learningMaterials.newLearningMaterial.url(testUrl);
      await page.learningMaterials.newLearningMaterial.status('2');
      await page.learningMaterials.newLearningMaterial.role('2');
      await page.learningMaterials.newLearningMaterial.description(testDescription);
      await page.learningMaterials.newLearningMaterial.save();

      assert.equal(page.learningMaterials.current().count, 5);
      assert.equal(page.learningMaterials.current(4).title, testTitle);
    });

    test('create new citation learning material', async function (assert) {
      const testTitle = 'testsome title';
      const testAuthor = 'testsome author';
      const testDescription = 'testsome description';
      const testCitation = 'testsome citation';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      assert.ok(page.learningMaterials.canSearch);
      await page.learningMaterials.createNew();
      await page.learningMaterials.pickNew('Citation');
      assert.notOk(page.learningMaterials.canSearch, 'search box is hidden while new group are being added');

      await page.learningMaterials.newLearningMaterial.name(testTitle);
      assert.equal(page.learningMaterials.newLearningMaterial.userName, '0 guy M. Mc0son');
      await page.learningMaterials.newLearningMaterial.author(testAuthor);
      await page.learningMaterials.newLearningMaterial.citation(testCitation);
      await page.learningMaterials.newLearningMaterial.status('2');
      await page.learningMaterials.newLearningMaterial.role('2');
      await page.learningMaterials.newLearningMaterial.description(testDescription);
      await page.learningMaterials.newLearningMaterial.save();

      assert.equal(page.learningMaterials.current().count, 5);
      assert.equal(page.learningMaterials.current(4).title, testTitle);
    });

    test('can only add one learning-material at a time', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      assert.ok(page.learningMaterials.canCreateNew);
      assert.notOk(page.learningMaterials.canCollapse);
      await page.learningMaterials.createNew();
      await page.learningMaterials.pickNew('File');
      assert.notOk(page.learningMaterials.canCreateNew);
      assert.ok(page.learningMaterials.canCollapse);
    });

    test('cancel new learning material', async function (assert) {

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      assert.ok(page.learningMaterials.canSearch);
      await page.learningMaterials.createNew();
      await page.learningMaterials.pickNew('Citation');
      await page.learningMaterials.newLearningMaterial.cancel();

      assert.equal(page.learningMaterials.current().count, 4);
    });

    test('view copyright file learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();

      assert.equal(page.learningMaterials.manager.name.value, 'learning material 0');
      assert.equal(page.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.equal(page.learningMaterials.manager.description, '0 lm description');
      assert.ok(page.learningMaterials.manager.hasFile);
      assert.ok(page.learningMaterials.manager.hasCopyrightPermission);
      assert.equal(page.learningMaterials.manager.copyrightPermission, 'Yes');
      assert.notOk(page.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.learningMaterials.manager.hasLink);
      assert.notOk(page.learningMaterials.manager.hasCitation);
    });

    test('view rationale file learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(1).details();

      assert.equal(page.learningMaterials.manager.name.value, 'learning material 1');
      assert.equal(page.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.equal(page.learningMaterials.manager.description, '1 lm description');
      assert.ok(page.learningMaterials.manager.hasFile);
      assert.notOk(page.learningMaterials.manager.hasCopyrightPermission);
      assert.ok(page.learningMaterials.manager.hasCopyrightRationale);
      assert.equal(page.learningMaterials.manager.copyrightRationale, 'reason is thus');
      assert.notOk(page.learningMaterials.manager.hasLink);
      assert.notOk(page.learningMaterials.manager.hasCitation);
    });

    test('view url file learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(1).details();

      assert.equal(page.learningMaterials.manager.name.value, 'learning material 1');
      assert.equal(page.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.equal(page.learningMaterials.manager.description, '1 lm description');
      assert.equal(page.learningMaterials.manager.uploadDate, moment('2011-03-14').format('M-D-YYYY'));
      assert.ok(page.learningMaterials.manager.hasFile);
      assert.equal(page.learningMaterials.manager.downloadText, 'filename');
      assert.equal(page.learningMaterials.manager.downloadUrl, 'http://example.com/file');
      assert.notOk(page.learningMaterials.manager.hasLink);
      assert.notOk(page.learningMaterials.manager.hasCitation);
    });

    test('view link learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(2).details();

      assert.equal(page.learningMaterials.manager.name.value, 'learning material 2');
      assert.equal(page.learningMaterials.manager.author, 'Hunter Pence');
      assert.equal(page.learningMaterials.manager.description, '2 lm description');
      assert.equal(page.learningMaterials.manager.uploadDate, today.format('M-D-YYYY'));
      assert.ok(page.learningMaterials.manager.hasLink);
      assert.equal(page.learningMaterials.manager.link, 'www.example.com');

      assert.notOk(page.learningMaterials.manager.hasCopyrightPermission);
      assert.notOk(page.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.learningMaterials.manager.hasFile);
      assert.notOk(page.learningMaterials.manager.hasCitation);
    });

    test('view citation learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(3).details();

      assert.equal(page.learningMaterials.manager.name.value, 'learning material 3');
      assert.equal(page.learningMaterials.manager.author, 'Willie Mays');
      assert.equal(page.learningMaterials.manager.description, '3 lm description');
      assert.equal(page.learningMaterials.manager.uploadDate, moment('2016-12-12').format('M-D-YYYY'));
      assert.ok(page.learningMaterials.manager.hasCitation);
      assert.equal(page.learningMaterials.manager.citation, 'a citation');

      assert.notOk(page.learningMaterials.manager.hasCopyrightPermission);
      assert.notOk(page.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.learningMaterials.manager.hasFile);
      assert.notOk(page.learningMaterials.manager.hasLink);
    });

    test('edit learning material', async function (assert) {
      let newNote = 'text text. Woo hoo!';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();
      await page.learningMaterials.manager.required();
      await page.learningMaterials.manager.publicNotes();
      await page.learningMaterials.manager.status(3);
      await page.learningMaterials.manager.notes(newNote);

      await page.learningMaterials.manager.save();

      assert.equal(page.learningMaterials.current(0).title, 'learning material 0');
      assert.equal(page.learningMaterials.current(0).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(0).required, 'Yes');
      assert.notOk(page.learningMaterials.current(0).isNotePublic);
      assert.equal(page.learningMaterials.current(0).notes, 'Yes');
      assert.equal(page.learningMaterials.current(0).status, 'status 2');

      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.notesValue, `<p>${newNote}</p>`);
      assert.equal(page.learningMaterials.manager.statusValue, 3);
    });

    test('cancel editing learning material', async function (assert) {
      let newNote = 'text text. Woo hoo!';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();
      await page.learningMaterials.manager.required();
      await page.learningMaterials.manager.publicNotes();
      await page.learningMaterials.manager.status(3);
      await page.learningMaterials.manager.notes(newNote);

      await page.learningMaterials.manager.cancel();

      assert.equal(page.learningMaterials.current(0).title, 'learning material 0');
      assert.equal(page.learningMaterials.current(0).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(0).required, 'No');
      assert.equal(page.learningMaterials.current(0).notes, 'No');
      assert.notOk(page.learningMaterials.current(0).isNotePublic);
      assert.equal(page.learningMaterials.current(0).mesh, 'descriptor 1 descriptor 2');
      assert.equal(page.learningMaterials.current(0).status, 'status 0');

      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.notesValue, '');
      assert.equal(page.learningMaterials.manager.statusValue, 1);
    });

    test('manage terms', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms().count, 2);
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(0).title, 'descriptor 1');
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(1).title, 'descriptor 2');
      await page.learningMaterials.manager.meshManager.search('descriptor');
      await page.learningMaterials.manager.meshManager.runSearch();

      assert.equal(page.learningMaterials.manager.meshManager.searchResults().count, 6);
      for (let i = 0; i < 6; i++) {
        assert.equal(page.learningMaterials.manager.meshManager.searchResults(i).title, `descriptor ${i}`);
      }
      assert.notOk(page.learningMaterials.manager.meshManager.searchResults(0).isDisabled);
      assert.ok(page.learningMaterials.manager.meshManager.searchResults(1).isDisabled);
      assert.ok(page.learningMaterials.manager.meshManager.searchResults(2).isDisabled);
      assert.notOk(page.learningMaterials.manager.meshManager.searchResults(3).isDisabled);
      assert.notOk(page.learningMaterials.manager.meshManager.searchResults(4).isDisabled);
      assert.notOk(page.learningMaterials.manager.meshManager.searchResults(5).isDisabled);

      await page.learningMaterials.manager.meshManager.selectedTerms(0).remove();
      await page.learningMaterials.manager.meshManager.searchResults(0).add();
      assert.ok(page.learningMaterials.manager.meshManager.searchResults(0).isDisabled);
      assert.notOk(page.learningMaterials.manager.meshManager.searchResults(1).isDisabled);
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms().count, 2);

      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(0).title, 'descriptor 0');
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(1).title, 'descriptor 2');
    });

    test('save terms', async function (assert) {
      assert.expect(5);
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms().count, 2);
      await page.learningMaterials.manager.meshManager.search('descriptor');
      await page.learningMaterials.manager.meshManager.runSearch();

      await page.learningMaterials.manager.meshManager.selectedTerms(0).remove();
      await page.learningMaterials.manager.meshManager.searchResults(0).add();

      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(0).title, 'descriptor 0');
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(1).title, 'descriptor 2');

      await page.learningMaterials.manager.save();
      assert.equal(page.learningMaterials.current(0).mesh, 'descriptor 0 descriptor 2');
    });

    test('cancel term changes', async function (assert) {
      assert.expect(5);
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms().count, 2);
      await page.learningMaterials.manager.meshManager.search('descriptor');
      await page.learningMaterials.manager.meshManager.runSearch();

      await page.learningMaterials.manager.meshManager.selectedTerms(0).remove();
      await page.learningMaterials.manager.meshManager.searchResults(0).add();

      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(0).title, 'descriptor 0');
      assert.equal(page.learningMaterials.manager.meshManager.selectedTerms(1).title, 'descriptor 2');

      await page.learningMaterials.manager.cancel();
      assert.equal(page.learningMaterials.current(0).mesh, 'descriptor 1 descriptor 2');
    });

    test('find and add learning material', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.search('doc');
      assert.equal(page.learningMaterials.searchResults().count, 1);

      assert.equal(page.learningMaterials.searchResults(0).title, 'Letter to Doc Brown');
      assert.ok(page.learningMaterials.searchResults(0).hasFileIcon);
      assert.equal(page.learningMaterials.searchResults(0).properties().count, 3);
      assert.equal(page.learningMaterials.searchResults(0).properties(0).value, 'Owner: 0 guy M. Mc0son');
      assert.equal(page.learningMaterials.searchResults(0).properties(1).value, 'Content Author: ' + 'Marty McFly');
      assert.equal(page.learningMaterials.searchResults(0).properties(2).value, 'Upload date: ' + moment('2016-03-03').format('M-D-YYYY'));
      await page.learningMaterials.searchResults(0).add();
      assert.equal(page.learningMaterials.current().count, 5);
    });

    test('add timed release start date', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      await page.learningMaterials.manager.addStartDate();

      const newDate = moment().hour(10).minute(10).add(1, 'day').add(1, 'month');
      await page.learningMaterials.manager.startDate(newDate.toDate());
      await page.learningMaterials.manager.startTime.hour(10);
      await page.learningMaterials.manager.startTime.minute(10);
      await page.learningMaterials.manager.startTime.ampm('am');
      await page.learningMaterials.manager.save();
      assert.ok(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.timedReleaseSummary, '(Available: ' + newDate.format('L LT') + ')');
    });

    test('add timed release start and end date', async function (assert) {
      const newStartDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);
      const newEndDate = newStartDate.clone().add(1, 'minute');

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      await page.learningMaterials.manager.addStartDate();

      await page.learningMaterials.manager.startDate(newStartDate.toDate());
      await page.learningMaterials.manager.startTime.hour(10);
      await page.learningMaterials.manager.startTime.minute(10);
      await page.learningMaterials.manager.startTime.ampm('am');

      await page.learningMaterials.manager.addEndDate();
      await page.learningMaterials.manager.endDate(newEndDate.toDate());
      await page.learningMaterials.manager.endTime.hour(10);
      await page.learningMaterials.manager.endTime.minute(11);
      await page.learningMaterials.manager.endTime.ampm('am');

      await page.learningMaterials.manager.save();
      assert.ok(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      const formatedStartDate = newStartDate.locale('en').format('L LT');
      const formatedEndDate = newEndDate.locale('en').format('L LT');
      assert.equal(page.learningMaterials.manager.timedReleaseSummary, '(Available: ' + formatedStartDate + ' and available until ' + formatedEndDate + ')');
    });

    test('add timed release end date', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      await page.learningMaterials.manager.addEndDate();

      const newDate = moment().hour(10).minute(10).add(1, 'day').add(1, 'month');
      await page.learningMaterials.manager.endDate(newDate.toDate());
      await page.learningMaterials.manager.endTime.hour(10);
      await page.learningMaterials.manager.endTime.minute(10);
      await page.learningMaterials.manager.endTime.ampm('am');
      await page.learningMaterials.manager.save();
      assert.ok(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.timedReleaseSummary, '(Available until ' + newDate.format('L LT') + ')');
    });

    test('end date is after start date', async function (assert) {
      const newDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.learningMaterials.current(0).isTimedRelease);
      await page.learningMaterials.current(0).details();
      assert.notOk(page.learningMaterials.manager.hasEndDateValidationError);
      await page.learningMaterials.manager.addStartDate();

      await page.learningMaterials.manager.startDate(newDate.toDate());
      await page.learningMaterials.manager.startTime.hour(10);
      await page.learningMaterials.manager.startTime.minute(10);
      await page.learningMaterials.manager.startTime.ampm('am');

      await page.learningMaterials.manager.addEndDate();
      await page.learningMaterials.manager.endDate(newDate.toDate());
      await page.learningMaterials.manager.endTime.hour(10);
      await page.learningMaterials.manager.endTime.minute(10);
      await page.learningMaterials.manager.endTime.ampm('am');
      await page.learningMaterials.manager.save();

      assert.ok(page.learningMaterials.manager.hasEndDateValidationError);
      const formatedDate = newDate.locale('en').format('L LT');
      assert.equal(page.learningMaterials.manager.timedReleaseSummary, `(Available: ${formatedDate} and available until ${formatedDate})`);
    });

    test('edit learning material with no other links #3617', async function (assert) {
      let newTitle = 'text text. Woo hoo!';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 4);
      await page.learningMaterials.current(0).details();
      assert.ok(page.learningMaterials.manager.name.isPresent);
      await page.learningMaterials.manager.name.fillIn(newTitle);

      await page.learningMaterials.manager.save();

      assert.equal(page.learningMaterials.current(0).title, newTitle);

      await page.learningMaterials.current(0).details();
      assert.equal(page.learningMaterials.manager.name.value, newTitle);
    });
  });
  module('Double Linked Materials', function (hooks) {
    hooks.beforeEach(function () {
      const course = this.server.create('course', {
        year: 2013,
        school: this.school,
      });
      const session = this.server.create('session', {
        course,
      });
      const learningMaterial = this.server.create('learningMaterial', {
        originalAuthor: 'Jennifer Johnson',
        owningUserId: this.user.id,
        statusId: 1,
        userRoleId: 1,
        copyrightPermission: true,
        filename: 'something.pdf',
        absoluteFileUri: 'http://somethingsomething.com/something.pdf',
        uploadDate: moment('2015-02-12').toDate(),
      });
      this.server.create('sessionLearningMaterial', {
        learningMaterial,
        session,
        required: false,
        meshDescriptorIds: [2, 3],
        position: 0,
      });
      this.server.create('courseLearningMaterial', {
        learningMaterial,
        course,
        required: false,
        position: 1,
      });
    });

    test('list learning materials', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(currentRouteName(), 'session.index');

      assert.equal(page.learningMaterials.current().count, 1);

      assert.equal(page.learningMaterials.current(0).title, 'learning material 0');
      assert.equal(page.learningMaterials.current(0).owner, '0 guy M. Mc0son');
      assert.equal(page.learningMaterials.current(0).required, 'No');
      assert.equal(page.learningMaterials.current(0).notes, 'No');
      assert.notOk(page.learningMaterials.current(0).isNotePublic);
      assert.equal(page.learningMaterials.current(0).mesh, 'descriptor 1 descriptor 2');
      assert.equal(page.learningMaterials.current(0).status, 'status 0');
    });

    test('view learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.equal(page.learningMaterials.current().count, 1);
      await page.learningMaterials.current(0).details();

      assert.equal(page.learningMaterials.manager.nameValue, 'learning material 0');
      assert.notOk(page.learningMaterials.manager.name.isPresent);
      assert.equal(page.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.equal(page.learningMaterials.manager.description, '0 lm description');
      assert.ok(page.learningMaterials.manager.hasFile);
      assert.ok(page.learningMaterials.manager.hasCopyrightPermission);
      assert.equal(page.learningMaterials.manager.copyrightPermission, 'Yes');
      assert.notOk(page.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.learningMaterials.manager.hasLink);
      assert.notOk(page.learningMaterials.manager.hasCitation);
    });
  });
});
