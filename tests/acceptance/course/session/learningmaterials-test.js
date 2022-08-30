import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import moment from 'moment';
import { currentRouteName } from '@ember/test-helpers';
import { setupApplicationTest } from 'dummy/tests/helpers';
import page from 'ilios-common/page-objects/session';

const today = moment();

module('Acceptance | Session - Learning Materials', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
    this.user2 = this.server.create('user', { displayName: 'Clem Chowder' });
    this.server.create('academicYear');
    this.server.create('learningMaterialStatus', {
      learningMaterialIds: [1],
    });
    this.server.createList('learningMaterialStatus', 5);
    this.server.createList('learningMaterialUserRole', 3);
    this.server.createList('meshDescriptor', 6);
  });
  module('Single Linked Materials', function (hooks2) {
    hooks2.beforeEach(function () {
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
        owningUserId: this.user2.id,
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
        absoluteFileUri: 'http://bttf.com/letter.txt',
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
      assert.strictEqual(currentRouteName(), 'session.index');

      assert.strictEqual(page.details.learningMaterials.current.length, 4);

      assert.strictEqual(page.details.learningMaterials.current[0].title, 'learning material 0');
      assert.strictEqual(
        page.details.learningMaterials.current[0].owner.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      assert.notOk(page.details.learningMaterials.current[0].owner.userNameInfo.hasAdditionalInfo);
      assert.strictEqual(page.details.learningMaterials.current[0].required, 'No');
      assert.strictEqual(page.details.learningMaterials.current[0].notes, 'No');
      assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
      assert.strictEqual(
        page.details.learningMaterials.current[0].mesh,
        'descriptor 1 descriptor 2'
      );
      assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 0');

      assert.strictEqual(page.details.learningMaterials.current[1].title, 'learning material 1');
      assert.strictEqual(
        page.details.learningMaterials.current[1].owner.userNameInfo.fullName,
        'Clem Chowder'
      );
      assert.ok(page.details.learningMaterials.current[1].owner.userNameInfo.hasAdditionalInfo);
      assert.notOk(page.details.learningMaterials.current[1].owner.userNameInfo.isTooltipVisible);
      await page.details.learningMaterials.current[1].owner.userNameInfo.expandTooltip();
      assert.strictEqual(
        page.details.learningMaterials.current[1].owner.userNameInfo.tooltipContents,
        'Campus name of record: 1 guy M, Mc1son'
      );
      await page.details.learningMaterials.current[1].owner.userNameInfo.closeTooltip();
      assert.notOk(page.details.learningMaterials.current[1].owner.userNameInfo.isTooltipVisible);
      assert.strictEqual(page.details.learningMaterials.current[1].required, 'No');
      assert.strictEqual(page.details.learningMaterials.current[1].notes, 'No');
      assert.notOk(page.details.learningMaterials.current[1].isNotePublic);
      assert.strictEqual(page.details.learningMaterials.current[1].mesh, 'None');
      assert.strictEqual(page.details.learningMaterials.current[1].status, 'status 0');
      assert.strictEqual(page.details.learningMaterials.current[1].status, 'status 0');

      assert.strictEqual(page.details.learningMaterials.current[2].title, 'learning material 2');
      assert.strictEqual(
        page.details.learningMaterials.current[2].owner.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      assert.notOk(page.details.learningMaterials.current[2].owner.userNameInfo.hasAdditionalInfo);
      assert.strictEqual(page.details.learningMaterials.current[2].required, 'Yes');
      assert.strictEqual(page.details.learningMaterials.current[2].notes, 'No');
      assert.notOk(page.details.learningMaterials.current[2].isNotePublic);
      assert.strictEqual(page.details.learningMaterials.current[2].mesh, 'None');
      assert.strictEqual(page.details.learningMaterials.current[2].status, 'status 0');
      assert.strictEqual(page.details.learningMaterials.current[2].status, 'status 0');

      assert.strictEqual(page.details.learningMaterials.current[3].title, 'learning material 3');
      assert.strictEqual(
        page.details.learningMaterials.current[3].owner.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      assert.notOk(page.details.learningMaterials.current[3].owner.userNameInfo.hasAdditionalInfo);
      assert.strictEqual(page.details.learningMaterials.current[3].required, 'Yes');
      assert.strictEqual(page.details.learningMaterials.current[3].notes, 'Yes');
      assert.ok(page.details.learningMaterials.current[3].isNotePublic);
      assert.strictEqual(page.details.learningMaterials.current[3].mesh, 'None');
      assert.strictEqual(page.details.learningMaterials.current[3].status, 'status 0');
    });

    test('create new link learning material', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const testTitle = 'testsome title';
      const testAuthor = 'testsome author';
      const testDescription = 'testsome description';
      const testUrl = 'http://www.ucsf.edu/';

      assert.strictEqual(this.server.db.learningMaterials.length, 5);
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      assert.ok(page.details.learningMaterials.search.isVisible);
      await page.details.learningMaterials.createNew();
      await page.details.learningMaterials.pickNew('Web Link');
      assert.notOk(
        page.details.learningMaterials.search.isVisible,
        'search box is hidden while new group are being added'
      );

      await page.details.learningMaterials.newLearningMaterial.name(testTitle);
      assert.strictEqual(
        page.details.learningMaterials.newLearningMaterial.owningUser.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      await page.details.learningMaterials.newLearningMaterial.author(testAuthor);
      await page.details.learningMaterials.newLearningMaterial.url.set(testUrl);
      await page.details.learningMaterials.newLearningMaterial.status('2');
      await page.details.learningMaterials.newLearningMaterial.role('2');
      await page.details.learningMaterials.newLearningMaterial.description(testDescription);
      await page.details.learningMaterials.newLearningMaterial.save();

      assert.strictEqual(this.server.db.learningMaterials.length, 6);
      assert.strictEqual(this.server.db.learningMaterials[5].link, testUrl);
      assert.strictEqual(page.details.learningMaterials.current.length, 5);
      assert.strictEqual(page.details.learningMaterials.current[4].title, testTitle);
    });

    test('create new citation learning material', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const testTitle = 'testsome title';
      const testAuthor = 'testsome author';
      const testDescription = 'testsome description';
      const testCitation = 'testsome citation';

      assert.strictEqual(this.server.db.learningMaterials.length, 5);
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      assert.ok(page.details.learningMaterials.search.isVisible);
      await page.details.learningMaterials.createNew();
      await page.details.learningMaterials.pickNew('Citation');
      assert.notOk(
        page.details.learningMaterials.search.isVisible,
        'search box is hidden while new group are being added'
      );

      await page.details.learningMaterials.newLearningMaterial.name(testTitle);
      assert.strictEqual(
        page.details.learningMaterials.newLearningMaterial.owningUser.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      await page.details.learningMaterials.newLearningMaterial.author(testAuthor);
      await page.details.learningMaterials.newLearningMaterial.citation(testCitation);
      await page.details.learningMaterials.newLearningMaterial.status('2');
      await page.details.learningMaterials.newLearningMaterial.role('2');
      await page.details.learningMaterials.newLearningMaterial.description(testDescription);
      await page.details.learningMaterials.newLearningMaterial.save();

      assert.strictEqual(this.server.db.learningMaterials.length, 6);
      assert.strictEqual(this.server.db.learningMaterials[5].citation, testCitation);
      assert.strictEqual(page.details.learningMaterials.current.length, 5);
      assert.strictEqual(page.details.learningMaterials.current[4].title, testTitle);
    });

    test('can only add one learning-material at a time', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      assert.ok(page.details.learningMaterials.canCreateNew);
      assert.notOk(page.details.learningMaterials.canCollapse);
      await page.details.learningMaterials.createNew();
      await page.details.learningMaterials.pickNew('File');
      assert.notOk(page.details.learningMaterials.canCreateNew);
      assert.ok(page.details.learningMaterials.canCollapse);
    });

    test('cancel new learning material', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      assert.ok(page.details.learningMaterials.search.isVisible);
      await page.details.learningMaterials.createNew();
      await page.details.learningMaterials.pickNew('Citation');
      await page.details.learningMaterials.newLearningMaterial.cancel();

      assert.strictEqual(page.details.learningMaterials.current.length, 4);
    });

    test('view copyright file learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();

      assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 0');
      assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.strictEqual(
        page.details.learningMaterials.manager.description.value,
        '0 lm description'
      );
      assert.ok(page.details.learningMaterials.manager.hasFile);
      assert.ok(page.details.learningMaterials.manager.hasCopyrightPermission);
      assert.strictEqual(page.details.learningMaterials.manager.copyrightPermission, 'Yes');
      assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.details.learningMaterials.manager.hasLink);
      assert.notOk(page.details.learningMaterials.manager.hasCitation);
    });

    test('view rationale file learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[1].details();

      assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 1');
      assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.strictEqual(
        page.details.learningMaterials.manager.description.value,
        '1 lm description'
      );
      assert.ok(page.details.learningMaterials.manager.hasFile);
      assert.notOk(page.details.learningMaterials.manager.hasCopyrightPermission);
      assert.ok(page.details.learningMaterials.manager.hasCopyrightRationale);
      assert.strictEqual(
        page.details.learningMaterials.manager.copyrightRationale,
        'reason is thus'
      );
      assert.notOk(page.details.learningMaterials.manager.hasLink);
      assert.notOk(page.details.learningMaterials.manager.hasCitation);
    });

    test('view url file learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[1].details();

      assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 1');
      assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.strictEqual(
        page.details.learningMaterials.manager.description.value,
        '1 lm description'
      );
      assert.strictEqual(page.details.learningMaterials.manager.uploadDate, '3/14/2011');
      assert.ok(page.details.learningMaterials.manager.hasFile);
      assert.strictEqual(page.details.learningMaterials.manager.downloadText, 'filename');
      assert.strictEqual(
        page.details.learningMaterials.manager.downloadUrl,
        'http://example.com/file'
      );
      assert.notOk(page.details.learningMaterials.manager.hasLink);
      assert.notOk(page.details.learningMaterials.manager.hasCitation);
    });

    test('view link learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[2].details();

      assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 2');
      assert.strictEqual(page.details.learningMaterials.manager.author, 'Hunter Pence');
      assert.strictEqual(
        page.details.learningMaterials.manager.description.value,
        '2 lm description'
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.uploadDate,
        this.intl.formatDate(today.toDate())
      );
      assert.ok(page.details.learningMaterials.manager.hasLink);
      assert.strictEqual(page.details.learningMaterials.manager.link, 'www.example.com');

      assert.notOk(page.details.learningMaterials.manager.hasCopyrightPermission);
      assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.details.learningMaterials.manager.hasFile);
      assert.notOk(page.details.learningMaterials.manager.hasCitation);
    });

    test('view citation learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[3].details();

      assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 3');
      assert.strictEqual(page.details.learningMaterials.manager.author, 'Willie Mays');
      assert.strictEqual(
        page.details.learningMaterials.manager.description.value,
        '3 lm description'
      );
      assert.strictEqual(page.details.learningMaterials.manager.uploadDate, '12/12/2016');
      assert.ok(page.details.learningMaterials.manager.hasCitation);
      assert.strictEqual(page.details.learningMaterials.manager.citation, 'a citation');

      assert.notOk(page.details.learningMaterials.manager.hasCopyrightPermission);
      assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.details.learningMaterials.manager.hasFile);
      assert.notOk(page.details.learningMaterials.manager.hasLink);
    });

    test('edit learning material', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const newNote = 'text text. Woo hoo!';
      const newDescription = 'high altitude training';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();
      await page.details.learningMaterials.manager.required();
      await page.details.learningMaterials.manager.publicNotes();
      await page.details.learningMaterials.manager.status(3);
      await page.details.learningMaterials.manager.notes.update(newNote);
      await page.details.learningMaterials.manager.description.update(newDescription);

      await page.details.learningMaterials.manager.save();

      assert.strictEqual(page.details.learningMaterials.current[0].title, 'learning material 0');
      assert.strictEqual(
        page.details.learningMaterials.current[0].owner.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      assert.strictEqual(page.details.learningMaterials.current[0].required, 'Yes');
      assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
      assert.strictEqual(page.details.learningMaterials.current[0].notes, 'Yes');
      assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 2');

      await page.details.learningMaterials.current[0].details();
      assert.strictEqual(
        await page.details.learningMaterials.manager.notes.value(),
        `<p>${newNote}</p>`
      );
      assert.strictEqual(
        await page.details.learningMaterials.manager.description.editorValue(),
        `<p>${newDescription}</p>`
      );

      assert.strictEqual(page.details.learningMaterials.manager.statusValue, '3');
    });

    test('change from required to not required #1249', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[2].details();
      await page.details.learningMaterials.manager.required();

      await page.details.learningMaterials.manager.save();

      assert.strictEqual(page.details.learningMaterials.current[2].title, 'learning material 2');
      assert.strictEqual(page.details.learningMaterials.current[2].required, 'No');
    });

    test('cancel editing learning material', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const newNote = 'text text. Woo hoo!';
      const newDescription = 'the sun is shining.';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();
      await page.details.learningMaterials.manager.required();
      await page.details.learningMaterials.manager.publicNotes();
      await page.details.learningMaterials.manager.status(3);
      await page.details.learningMaterials.manager.notes.update(newNote);
      await page.details.learningMaterials.manager.description.update(newDescription);

      await page.details.learningMaterials.manager.cancel();

      assert.strictEqual(page.details.learningMaterials.current[0].title, 'learning material 0');
      assert.strictEqual(
        page.details.learningMaterials.current[0].owner.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      assert.strictEqual(page.details.learningMaterials.current[0].required, 'No');
      assert.strictEqual(page.details.learningMaterials.current[0].notes, 'No');
      assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
      assert.strictEqual(
        page.details.learningMaterials.current[0].mesh,
        'descriptor 1 descriptor 2'
      );
      assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 0');

      await page.details.learningMaterials.current[0].details();
      assert.strictEqual(await page.details.learningMaterials.manager.notes.value(), '');
      assert.strictEqual(page.details.learningMaterials.manager.statusValue, '1');
      assert.strictEqual(
        await page.details.learningMaterials.manager.description.editorValue(),
        '<p>0 lm description</p>'
      );
    });

    test('manage terms', async function (assert) {
      assert.expect(22);
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms.length,
        2
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
        'descriptor 1'
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
        'descriptor 2'
      );
      await page.details.learningMaterials.manager.meshManager.search.set('descriptor');
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.searchResults.length,
        6
      );
      for (let i = 0; i < 6; i++) {
        assert.strictEqual(
          page.details.learningMaterials.manager.meshManager.searchResults[i].title,
          `descriptor ${i}`
        );
      }
      assert.notOk(page.details.learningMaterials.manager.meshManager.searchResults[0].isDisabled);
      assert.ok(page.details.learningMaterials.manager.meshManager.searchResults[1].isDisabled);
      assert.ok(page.details.learningMaterials.manager.meshManager.searchResults[2].isDisabled);
      assert.notOk(page.details.learningMaterials.manager.meshManager.searchResults[3].isDisabled);
      assert.notOk(page.details.learningMaterials.manager.meshManager.searchResults[4].isDisabled);
      assert.notOk(page.details.learningMaterials.manager.meshManager.searchResults[5].isDisabled);
      await page.details.learningMaterials.manager.meshManager.searchResults[0].add();
      assert.ok(page.details.learningMaterials.manager.meshManager.searchResults[0].isDisabled);
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms.length,
        3
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
        'descriptor 0'
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
        'descriptor 1'
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[2].title,
        'descriptor 2'
      );
    });

    test('save terms', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(5);
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms.length,
        2
      );
      await page.details.learningMaterials.manager.meshManager.selectedTerms[0].remove();
      await page.details.learningMaterials.manager.meshManager.search.set('descriptor');
      await page.details.learningMaterials.manager.meshManager.searchResults[0].add();

      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
        'descriptor 0'
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
        'descriptor 2'
      );

      await page.details.learningMaterials.manager.save();
      assert.strictEqual(
        page.details.learningMaterials.current[0].mesh,
        'descriptor 0 descriptor 2'
      );
    });

    test('cancel term changes', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      assert.expect(5);
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms.length,
        2
      );
      await page.details.learningMaterials.manager.meshManager.selectedTerms[0].remove();
      await page.details.learningMaterials.manager.meshManager.search.set('descriptor');
      await page.details.learningMaterials.manager.meshManager.searchResults[0].add();

      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
        'descriptor 0'
      );
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
        'descriptor 2'
      );

      await page.details.learningMaterials.manager.cancel();
      assert.strictEqual(
        page.details.learningMaterials.current[0].mesh,
        'descriptor 1 descriptor 2'
      );
    });

    test('find and add learning material', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.search.search.set('doc');
      assert.strictEqual(page.details.learningMaterials.search.searchResults.length, 1);

      assert.strictEqual(
        page.details.learningMaterials.search.searchResults[0].title,
        'Letter to Doc Brown'
      );
      assert.ok(page.details.learningMaterials.search.searchResults[0].hasFileIcon);
      assert.strictEqual(
        page.details.learningMaterials.search.searchResults[0].properties.length,
        3
      );
      assert.strictEqual(
        page.details.learningMaterials.search.searchResults[0].properties[0].value,
        'Owner: 0 guy M. Mc0son'
      );
      assert.strictEqual(
        page.details.learningMaterials.search.searchResults[0].properties[1].value,
        'Content Author: ' + 'Marty McFly'
      );
      assert.strictEqual(
        page.details.learningMaterials.search.searchResults[0].properties[2].value,
        'Upload date: 3/3/2016'
      );
      await page.details.learningMaterials.search.searchResults[0].add();
      assert.strictEqual(page.details.learningMaterials.current.length, 5);
    });

    test('add timed release start date', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      await page.details.learningMaterials.manager.addStartDate();

      const newDate = moment().hour(10).minute(10).add(1, 'day').add(1, 'month');
      await page.details.learningMaterials.manager.startDate.datePicker.set(newDate.toDate());
      await page.details.learningMaterials.manager.startTime.timePicker.hour.select('10');
      await page.details.learningMaterials.manager.startTime.timePicker.minute.select('10');
      await page.details.learningMaterials.manager.startTime.timePicker.ampm.select('am');
      await page.details.learningMaterials.manager.save();
      assert.ok(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      const formattedNewDate = newDate.toDate().toLocaleString('en-us', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      assert.strictEqual(
        page.details.learningMaterials.manager.timedReleaseSummary,
        `(Available: ${formattedNewDate})`
      );
    });

    test('add timed release start and end date', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const newStartDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);
      const newEndDate = newStartDate.clone().add(1, 'minute');

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      await page.details.learningMaterials.manager.addStartDate();

      await page.details.learningMaterials.manager.startDate.datePicker.set(newStartDate.toDate());
      await page.details.learningMaterials.manager.startTime.timePicker.hour.select('10');
      await page.details.learningMaterials.manager.startTime.timePicker.minute.select('10');
      await page.details.learningMaterials.manager.startTime.timePicker.ampm.select('am');

      await page.details.learningMaterials.manager.addEndDate();
      await page.details.learningMaterials.manager.endDate.datePicker.set(newEndDate.toDate());
      await page.details.learningMaterials.manager.endTime.timePicker.hour.select('10');
      await page.details.learningMaterials.manager.endTime.timePicker.minute.select('11');
      await page.details.learningMaterials.manager.endTime.timePicker.ampm.select('am');

      await page.details.learningMaterials.manager.save();
      assert.ok(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      const formattedStartDate = newStartDate.toDate().toLocaleString('en', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      const formattedEndDate = newEndDate.toDate().toLocaleString('en', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      assert.strictEqual(
        page.details.learningMaterials.manager.timedReleaseSummary,
        `(Available: ${formattedStartDate} and available until ${formattedEndDate})`
      );
    });

    test('add timed release end date', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      await page.details.learningMaterials.manager.addEndDate();

      const newDate = moment().hour(10).minute(10).add(1, 'day').add(1, 'month');
      await page.details.learningMaterials.manager.endDate.datePicker.set(newDate.toDate());
      await page.details.learningMaterials.manager.endTime.timePicker.hour.select('10');
      await page.details.learningMaterials.manager.endTime.timePicker.minute.select('10');
      await page.details.learningMaterials.manager.endTime.timePicker.ampm.select('am');
      await page.details.learningMaterials.manager.save();
      assert.ok(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      const formattedNewDate = newDate.toDate().toLocaleString('en-us', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      assert.strictEqual(
        page.details.learningMaterials.manager.timedReleaseSummary,
        `(Available until ${formattedNewDate})`
      );
    });

    test('end date is after start date', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const newDate = moment().add(1, 'day').add(1, 'month').hour(10).minute(10);

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      assert.notOk(page.details.learningMaterials.manager.hasEndDateValidationError);
      await page.details.learningMaterials.manager.addStartDate();

      await page.details.learningMaterials.manager.startDate.datePicker.set(newDate.toDate());
      await page.details.learningMaterials.manager.startTime.timePicker.hour.select('10');
      await page.details.learningMaterials.manager.startTime.timePicker.minute.select('10');
      await page.details.learningMaterials.manager.startTime.timePicker.ampm.select('am');

      await page.details.learningMaterials.manager.addEndDate();
      await page.details.learningMaterials.manager.endDate.datePicker.set(newDate.toDate());
      await page.details.learningMaterials.manager.endTime.timePicker.hour.select('10');
      await page.details.learningMaterials.manager.endTime.timePicker.minute.select('10');
      await page.details.learningMaterials.manager.endTime.timePicker.ampm.select('am');
      await page.details.learningMaterials.manager.save();

      assert.ok(page.details.learningMaterials.manager.hasEndDateValidationError);
      const formattedDate = newDate.toDate().toLocaleString('en-us', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });
      assert.strictEqual(
        page.details.learningMaterials.manager.timedReleaseSummary,
        `(Available: ${formattedDate} and available until ${formattedDate})`
      );
    });

    test('edit learning material with no other links #3617', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      const newTitle = 'text text. Woo hoo!';

      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 4);
      await page.details.learningMaterials.current[0].details();
      assert.ok(page.details.learningMaterials.manager.name.isPresent);
      await page.details.learningMaterials.manager.name.fillIn(newTitle);

      await page.details.learningMaterials.manager.save();

      assert.strictEqual(page.details.learningMaterials.current[0].title, newTitle);

      await page.details.learningMaterials.current[0].details();
      assert.strictEqual(page.details.learningMaterials.manager.name.value, newTitle);
    });

    test('title too short', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      assert.notOk(page.details.learningMaterials.manager.hasTitleValidationError);
      await page.details.learningMaterials.manager.name.fillIn('a');
      await page.details.learningMaterials.manager.save();
      assert.ok(page.details.learningMaterials.manager.hasTitleValidationError);
    });

    test('title too long', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
      await page.details.learningMaterials.current[0].details();
      assert.notOk(page.details.learningMaterials.manager.hasTitleValidationError);
      await page.details.learningMaterials.manager.name.fillIn('0123456789'.repeat(13));
      await page.details.learningMaterials.manager.save();
      assert.ok(page.details.learningMaterials.manager.hasTitleValidationError);
    });

    test('missing copyright info #1204', async function (assert) {
      this.user.update({ administeredSchools: [this.school] });
      await page.visit({ courseId: 1, sessionId: 1 });
      await page.details.learningMaterials.createNew();
      await page.details.learningMaterials.pickNew('File');

      assert.notOk(page.details.learningMaterials.newLearningMaterial.hasAgreementValidationError);
      await page.details.learningMaterials.newLearningMaterial.save();
      assert.ok(page.details.learningMaterials.newLearningMaterial.hasAgreementValidationError);
      await page.details.learningMaterials.newLearningMaterial.agreement();
      assert.notOk(page.details.learningMaterials.newLearningMaterial.hasAgreementValidationError);
      await page.details.learningMaterials.newLearningMaterial.agreement();
      assert.ok(page.details.learningMaterials.newLearningMaterial.hasAgreementValidationError);
      await page.details.learningMaterials.newLearningMaterial.rationale('mine!');
      assert.notOk(page.details.learningMaterials.newLearningMaterial.hasAgreementValidationError);
    });
  });
  module('Double Linked Materials', function (hooks2) {
    hooks2.beforeEach(function () {
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
      assert.strictEqual(currentRouteName(), 'session.index');

      assert.strictEqual(page.details.learningMaterials.current.length, 1);

      assert.strictEqual(page.details.learningMaterials.current[0].title, 'learning material 0');
      assert.strictEqual(
        page.details.learningMaterials.current[0].owner.userNameInfo.fullName,
        '0 guy M. Mc0son'
      );
      assert.notOk(page.details.learningMaterials.current[0].owner.userNameInfo.hasAdditionalInfo);
      assert.strictEqual(page.details.learningMaterials.current[0].required, 'No');
      assert.strictEqual(page.details.learningMaterials.current[0].notes, 'No');
      assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
      assert.strictEqual(
        page.details.learningMaterials.current[0].mesh,
        'descriptor 1 descriptor 2'
      );
      assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 0');
    });

    test('view learning material details', async function (assert) {
      await page.visit({ courseId: 1, sessionId: 1 });
      assert.strictEqual(page.details.learningMaterials.current.length, 1);
      await page.details.learningMaterials.current[0].details();

      assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 0');
      assert.notOk(page.details.learningMaterials.manager.name.isPresent);
      assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
      assert.strictEqual(
        page.details.learningMaterials.manager.description.value,
        '0 lm description'
      );
      assert.ok(page.details.learningMaterials.manager.hasFile);
      assert.ok(page.details.learningMaterials.manager.hasCopyrightPermission);
      assert.strictEqual(page.details.learningMaterials.manager.copyrightPermission, 'Yes');
      assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
      assert.notOk(page.details.learningMaterials.manager.hasLink);
      assert.notOk(page.details.learningMaterials.manager.hasCitation);
    });
  });
});
