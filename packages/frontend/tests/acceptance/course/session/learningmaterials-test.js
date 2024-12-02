import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { DateTime } from 'luxon';
import { currentRouteName } from '@ember/test-helpers';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'ilios-common/page-objects/session';

const today = DateTime.fromObject({ hour: 8 });
import percySnapshot from '@percy/ember';

module('Acceptance | Session - Learning Materials', function (hooks) {
  setupApplicationTest(hooks);
  hooks.beforeEach(async function () {
    this.intl = this.owner.lookup('service:intl');
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school }, true);
    this.user2 = this.server.create('user', { displayName: 'Clem Chowder' });
    this.server.create('academic-year');

    const statuses = this.server.createList('learningMaterialStatus', 5);
    const roles = this.server.createList('learningMaterialUserRole', 3);
    const descriptors = this.server.createList('mesh-descriptor', 6);

    this.material1 = this.server.create('learning-material', {
      originalAuthor: 'Jennifer Johnson',
      owningUser: this.user,
      status: statuses[0],
      userRole: roles[0],
      copyrightPermission: true,
      filename: 'something.pdf',
      absoluteFileUri: 'http://somethingsomething.com/something.pdf',
      uploadDate: DateTime.fromObject({ year: 2015, month: 2, day: 12, hour: 8 }).toJSDate(),
    });
    const material2 = this.server.create('learning-material', {
      originalAuthor: 'Jennifer Johnson',
      owningUser: this.user2,
      status: statuses[0],
      userRole: roles[0],
      copyrightPermission: false,
      copyrightRationale: 'reason is thus',
      filename: 'filename',
      title: 'http://example.com/subdir1/subdir2/long_file_name.pdf',
      absoluteFileUri: 'http://example.com/subdir1/subdir2/long_file_name.pdf',
      uploadDate: DateTime.fromObject({ year: 2011, month: 3, day: 14, hour: 8 }).toJSDate(),
    });
    const material3 = this.server.create('learning-material', {
      originalAuthor: 'Hunter Pence',
      owningUser: this.user,
      status: statuses[0],
      userRole: roles[0],
      link: 'www.example.com',
      uploadDate: today.toJSDate(),
    });
    const material4 = this.server.create('learning-material', {
      originalAuthor: 'Willie Mays',
      owningUser: this.user,
      status: statuses[0],
      userRole: roles[0],
      citation: 'a citation',
      uploadDate: DateTime.fromObject({ year: 2016, month: 12, day: 12, hour: 8 }).toJSDate(),
    });
    this.server.create('learningMaterial', {
      originalAuthor: 'Marty McFly',
      owningUser: this.user,
      status: statuses[0],
      userRole: roles[0],
      filename: 'letter.txt',
      title: 'Letter to Doc Brown',
      absoluteFileUri: 'http://bttf.com/letter.txt',
      copyrightPermission: true,
      uploadDate: DateTime.fromObject({ year: 2016, month: 3, day: 3, hour: 8 }).toJSDate(),
    });
    this.course = this.server.create('course', {
      year: 2013,
      school: this.school,
    });
    const session = this.server.create('session', {
      course: this.course,
    });
    this.server.create('session-learning-material', {
      learningMaterial: this.material1,
      session,
      required: false,
      meshDescriptors: [descriptors[1], descriptors[2]],
      position: 0,
    });
    this.server.create('session-learning-material', {
      learningMaterial: material2,
      session,
      required: false,
      position: 1,
    });
    this.server.create('session-learning-material', {
      learningMaterial: material3,
      session,
      publicNotes: false,
      position: 2,
    });
    this.server.create('session-learning-material', {
      learningMaterial: material4,
      session,
      position: 3,
      notes: 'test notes',
    });
  });

  test('list learning materials', async function (assert) {
    assert.expect(39);
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    await percySnapshot(assert);
    assert.strictEqual(currentRouteName(), 'session.index');

    assert.strictEqual(page.details.learningMaterials.current.length, 4);

    assert.strictEqual(page.details.learningMaterials.current[0].title, 'learning material 0');
    assert.strictEqual(
      page.details.learningMaterials.current[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.notOk(page.details.learningMaterials.current[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.details.learningMaterials.current[0].required, 'No');
    assert.strictEqual(page.details.learningMaterials.current[0].notes, 'No');
    assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
    assert.strictEqual(page.details.learningMaterials.current[0].mesh, 'descriptor 1 descriptor 2');
    assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 0');

    assert.strictEqual(
      page.details.learningMaterials.current[1].title,
      'http://example.com/subdir1/subdir2/long_file_name.pdf',
    );
    assert.strictEqual(
      page.details.learningMaterials.current[1].userNameInfo.fullName,
      'Clem Chowder',
    );
    assert.ok(page.details.learningMaterials.current[1].userNameInfo.hasAdditionalInfo);
    assert.notOk(page.details.learningMaterials.current[1].userNameInfo.isTooltipVisible);
    await page.details.learningMaterials.current[1].userNameInfo.expandTooltip();
    assert.strictEqual(
      page.details.learningMaterials.current[1].userNameInfo.tooltipContents,
      'Campus name of record: 1 guy M, Mc1son',
    );
    await page.details.learningMaterials.current[1].userNameInfo.closeTooltip();
    assert.notOk(page.details.learningMaterials.current[1].userNameInfo.isTooltipVisible);
    assert.strictEqual(page.details.learningMaterials.current[1].required, 'No');
    assert.strictEqual(page.details.learningMaterials.current[1].notes, 'No');
    assert.notOk(page.details.learningMaterials.current[1].isNotePublic);
    assert.strictEqual(page.details.learningMaterials.current[1].mesh, 'None');
    assert.strictEqual(page.details.learningMaterials.current[1].status, 'status 0');
    assert.strictEqual(page.details.learningMaterials.current[1].status, 'status 0');

    assert.strictEqual(page.details.learningMaterials.current[2].title, 'learning material 2');
    assert.strictEqual(
      page.details.learningMaterials.current[2].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.notOk(page.details.learningMaterials.current[2].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.details.learningMaterials.current[2].required, 'Yes');
    assert.strictEqual(page.details.learningMaterials.current[2].notes, 'No');
    assert.notOk(page.details.learningMaterials.current[2].isNotePublic);
    assert.strictEqual(page.details.learningMaterials.current[2].mesh, 'None');
    assert.strictEqual(page.details.learningMaterials.current[2].status, 'status 0');
    assert.strictEqual(page.details.learningMaterials.current[2].status, 'status 0');

    assert.strictEqual(page.details.learningMaterials.current[3].title, 'learning material 3');
    assert.strictEqual(
      page.details.learningMaterials.current[3].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.notOk(page.details.learningMaterials.current[3].userNameInfo.hasAdditionalInfo);
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
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    assert.ok(page.details.learningMaterials.search.isVisible);
    await page.details.learningMaterials.createNew();
    await page.details.learningMaterials.pickNew('Web Link');
    assert.notOk(
      page.details.learningMaterials.search.isVisible,
      'search box is hidden while new group are being added',
    );

    await page.details.learningMaterials.newLearningMaterial.name(testTitle);
    assert.strictEqual(
      page.details.learningMaterials.newLearningMaterial.owningUser.userNameInfo.fullName,
      '0 guy M. Mc0son',
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
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    assert.ok(page.details.learningMaterials.search.isVisible);
    await page.details.learningMaterials.createNew();
    await page.details.learningMaterials.pickNew('Citation');
    assert.notOk(
      page.details.learningMaterials.search.isVisible,
      'search box is hidden while new group are being added',
    );

    await page.details.learningMaterials.newLearningMaterial.name(testTitle);
    assert.strictEqual(
      page.details.learningMaterials.newLearningMaterial.owningUser.userNameInfo.fullName,
      '0 guy M. Mc0son',
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
    await page.visit({ courseId: this.course.id, sessionId: 1 });
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

    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    assert.ok(page.details.learningMaterials.search.isVisible);
    await page.details.learningMaterials.createNew();
    await page.details.learningMaterials.pickNew('Citation');
    await page.details.learningMaterials.newLearningMaterial.cancel();

    assert.strictEqual(page.details.learningMaterials.current.length, 4);
  });

  test('view copyright file learning material details', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[0].details();

    assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 0');
    assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
    assert.strictEqual(
      page.details.learningMaterials.manager.description.value,
      '0 lm description',
    );
    assert.ok(page.details.learningMaterials.manager.hasFile);
    assert.ok(page.details.learningMaterials.manager.hasCopyrightPermission);
    assert.strictEqual(page.details.learningMaterials.manager.copyrightPermission, 'Yes');
    assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
    assert.notOk(page.details.learningMaterials.manager.hasLink);
    assert.notOk(page.details.learningMaterials.manager.hasCitation);
  });

  test('view rationale file learning material details', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[1].details();

    assert.strictEqual(
      page.details.learningMaterials.manager.nameValue,
      'http://example.com/subdir1/subdir2/long_file_name.pdf',
    );
    assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
    assert.strictEqual(
      page.details.learningMaterials.manager.description.value,
      '1 lm description',
    );
    assert.ok(page.details.learningMaterials.manager.hasFile);
    assert.notOk(page.details.learningMaterials.manager.hasCopyrightPermission);
    assert.ok(page.details.learningMaterials.manager.hasCopyrightRationale);
    assert.strictEqual(page.details.learningMaterials.manager.copyrightRationale, 'reason is thus');
    assert.notOk(page.details.learningMaterials.manager.hasLink);
    assert.notOk(page.details.learningMaterials.manager.hasCitation);
  });

  test('view url file learning material details', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[1].details();

    assert.strictEqual(
      page.details.learningMaterials.manager.nameValue,
      'http://example.com/subdir1/subdir2/long_file_name.pdf',
    );
    assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
    assert.strictEqual(
      page.details.learningMaterials.manager.description.value,
      '1 lm description',
    );
    assert.strictEqual(page.details.learningMaterials.manager.uploadDate, '03/14/2011');
    assert.ok(page.details.learningMaterials.manager.hasFile);
    assert.strictEqual(page.details.learningMaterials.manager.downloadText, 'filename');
    assert.strictEqual(
      page.details.learningMaterials.manager.downloadUrl,
      'http://example.com/subdir1/subdir2/long_file_name.pdf',
    );
    assert.notOk(page.details.learningMaterials.manager.hasLink);
    assert.notOk(page.details.learningMaterials.manager.hasCitation);
  });

  test('view link learning material details', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[2].details();

    assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 2');
    assert.strictEqual(page.details.learningMaterials.manager.author, 'Hunter Pence');
    assert.strictEqual(
      page.details.learningMaterials.manager.description.value,
      '2 lm description',
    );
    assert.strictEqual(
      page.details.learningMaterials.manager.uploadDate,
      this.intl.formatDate(today.toJSDate(), {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    );
    assert.ok(page.details.learningMaterials.manager.hasLink);
    assert.strictEqual(page.details.learningMaterials.manager.link, 'www.example.com');

    assert.notOk(page.details.learningMaterials.manager.hasCopyrightPermission);
    assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
    assert.notOk(page.details.learningMaterials.manager.hasFile);
    assert.notOk(page.details.learningMaterials.manager.hasCitation);
  });

  test('view citation learning material details', async function (assert) {
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[3].details();

    assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 3');
    assert.strictEqual(page.details.learningMaterials.manager.author, 'Willie Mays');
    assert.strictEqual(
      page.details.learningMaterials.manager.description.value,
      '3 lm description',
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

    await page.visit({ courseId: this.course.id, sessionId: 1 });
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
      page.details.learningMaterials.current[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(page.details.learningMaterials.current[0].required, 'Yes');
    assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
    assert.strictEqual(page.details.learningMaterials.current[0].notes, 'Yes');
    assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 2');

    await page.details.learningMaterials.current[0].details();
    assert.strictEqual(
      await page.details.learningMaterials.manager.notes.value(),
      `<p>${newNote}</p>`,
    );
    assert.strictEqual(
      await page.details.learningMaterials.manager.description.editorValue(),
      `<p>${newDescription}</p>`,
    );

    assert.strictEqual(page.details.learningMaterials.manager.statusValue, '3');
  });

  test('change from required to not required #1249', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });

    await page.visit({ courseId: this.course.id, sessionId: 1 });
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

    await page.visit({ courseId: this.course.id, sessionId: 1 });
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
      page.details.learningMaterials.current[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.strictEqual(page.details.learningMaterials.current[0].required, 'No');
    assert.strictEqual(page.details.learningMaterials.current[0].notes, 'No');
    assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
    assert.strictEqual(page.details.learningMaterials.current[0].mesh, 'descriptor 1 descriptor 2');
    assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 0');

    await page.details.learningMaterials.current[0].details();
    assert.strictEqual(await page.details.learningMaterials.manager.notes.value(), '');
    assert.strictEqual(page.details.learningMaterials.manager.statusValue, '1');
    assert.strictEqual(
      await page.details.learningMaterials.manager.description.editorValue(),
      '<p>0 lm description</p>',
    );
  });

  test('manage terms', async function (assert) {
    assert.expect(22);
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[0].details();
    assert.strictEqual(page.details.learningMaterials.manager.meshManager.selectedTerms.length, 2);
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
      'descriptor 1',
    );
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
      'descriptor 2',
    );
    await page.details.learningMaterials.manager.meshManager.search.set('descriptor');
    assert.strictEqual(page.details.learningMaterials.manager.meshManager.searchResults.length, 6);
    for (let i = 0; i < 6; i++) {
      assert.strictEqual(
        page.details.learningMaterials.manager.meshManager.searchResults[i].title,
        `descriptor ${i}`,
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
    assert.strictEqual(page.details.learningMaterials.manager.meshManager.selectedTerms.length, 3);
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
      'descriptor 0',
    );
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
      'descriptor 1',
    );
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[2].title,
      'descriptor 2',
    );
  });

  test('save terms', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[0].details();
    assert.strictEqual(page.details.learningMaterials.manager.meshManager.selectedTerms.length, 2);
    await page.details.learningMaterials.manager.meshManager.selectedTerms[0].remove();
    await page.details.learningMaterials.manager.meshManager.search.set('descriptor');
    await page.details.learningMaterials.manager.meshManager.searchResults[0].add();

    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
      'descriptor 0',
    );
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
      'descriptor 2',
    );

    await page.details.learningMaterials.manager.save();
    assert.strictEqual(page.details.learningMaterials.current[0].mesh, 'descriptor 0 descriptor 2');
  });

  test('cancel term changes', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.current[0].details();
    assert.strictEqual(page.details.learningMaterials.manager.meshManager.selectedTerms.length, 2);
    await page.details.learningMaterials.manager.meshManager.selectedTerms[0].remove();
    await page.details.learningMaterials.manager.meshManager.search.set('descriptor');
    await page.details.learningMaterials.manager.meshManager.searchResults[0].add();

    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[0].title,
      'descriptor 0',
    );
    assert.strictEqual(
      page.details.learningMaterials.manager.meshManager.selectedTerms[1].title,
      'descriptor 2',
    );

    await page.details.learningMaterials.manager.cancel();
    assert.strictEqual(page.details.learningMaterials.current[0].mesh, 'descriptor 1 descriptor 2');
  });

  test('find and add learning material', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.strictEqual(page.details.learningMaterials.current.length, 4);
    await page.details.learningMaterials.search.search.set('doc');
    assert.strictEqual(page.details.learningMaterials.search.searchResults.length, 1);

    assert.strictEqual(
      page.details.learningMaterials.search.searchResults[0].title,
      'Letter to Doc Brown',
    );
    assert.ok(page.details.learningMaterials.search.searchResults[0].hasFileIcon);
    assert.strictEqual(page.details.learningMaterials.search.searchResults[0].properties.length, 3);
    assert.strictEqual(
      page.details.learningMaterials.search.searchResults[0].properties[0].value,
      'Owner: 0 guy M. Mc0son',
    );
    assert.strictEqual(
      page.details.learningMaterials.search.searchResults[0].properties[1].value,
      'Content Author: ' + 'Marty McFly',
    );
    assert.strictEqual(
      page.details.learningMaterials.search.searchResults[0].properties[2].value,
      'Upload date: 03/03/2016',
    );
    await page.details.learningMaterials.search.searchResults[0].add();
    assert.strictEqual(page.details.learningMaterials.current.length, 5);
  });

  test('add timed release start date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    await page.details.learningMaterials.manager.addStartDate();

    const newDate = DateTime.fromObject({ hour: 10, minute: 10 }).plus({ days: 1, month: 1 });
    await page.details.learningMaterials.manager.startDate.datePicker.set(newDate.toJSDate());
    await page.details.learningMaterials.manager.startTime.timePicker.hour.select('10');
    await page.details.learningMaterials.manager.startTime.timePicker.minute.select('10');
    await page.details.learningMaterials.manager.startTime.timePicker.ampm.select('AM');
    await page.details.learningMaterials.manager.save();
    assert.ok(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    const formattedNewDate = this.intl.formatDate(newDate.toJSDate(), {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(
      page.details.learningMaterials.manager.timedReleaseSummary,
      `(Available: ${formattedNewDate})`,
    );
  });

  test('add timed release start and end date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const newStartDate = DateTime.fromObject({ hour: 10, minute: 10 }).plus({
      days: 1,
      month: 1,
    });
    const newEndDate = newStartDate.plus({ minutes: 1 });

    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    await page.details.learningMaterials.manager.addStartDate();

    await page.details.learningMaterials.manager.startDate.datePicker.set(newStartDate.toJSDate());
    await page.details.learningMaterials.manager.startTime.timePicker.hour.select('10');
    await page.details.learningMaterials.manager.startTime.timePicker.minute.select('10');
    await page.details.learningMaterials.manager.startTime.timePicker.ampm.select('AM');

    await page.details.learningMaterials.manager.addEndDate();
    await page.details.learningMaterials.manager.endDate.datePicker.set(newEndDate.toJSDate());
    await page.details.learningMaterials.manager.endTime.timePicker.hour.select('10');
    await page.details.learningMaterials.manager.endTime.timePicker.minute.select('11');
    await page.details.learningMaterials.manager.endTime.timePicker.ampm.select('AM');

    await page.details.learningMaterials.manager.save();
    assert.ok(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    const formattedStartDate = this.intl.formatDate(newStartDate.toJSDate(), {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const formattedEndDate = this.intl.formatDate(newEndDate.toJSDate(), {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(
      page.details.learningMaterials.manager.timedReleaseSummary,
      `(Available: ${formattedStartDate} until ${formattedEndDate})`,
    );
  });

  test('add timed release end date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    await page.details.learningMaterials.manager.addEndDate();

    const newDate = DateTime.fromObject({ hour: 10, minute: 10 }).plus({ days: 1, month: 1 });
    await page.details.learningMaterials.manager.endDate.datePicker.set(newDate.toJSDate());
    await page.details.learningMaterials.manager.endTime.timePicker.hour.select('10');
    await page.details.learningMaterials.manager.endTime.timePicker.minute.select('10');
    await page.details.learningMaterials.manager.endTime.timePicker.ampm.select('AM');
    await page.details.learningMaterials.manager.save();
    assert.ok(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    const formattedNewDate = this.intl.formatDate(newDate.toJSDate(), {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(
      page.details.learningMaterials.manager.timedReleaseSummary,
      `(Available until ${formattedNewDate})`,
    );
  });

  test('end date is after start date', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const newDate = DateTime.fromObject({ hour: 10, minute: 10 }).plus({ days: 1, month: 1 });

    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    assert.notOk(page.details.learningMaterials.manager.hasEndDateValidationError);
    await page.details.learningMaterials.manager.addStartDate();

    await page.details.learningMaterials.manager.startDate.datePicker.set(newDate.toJSDate());
    await page.details.learningMaterials.manager.startTime.timePicker.hour.select('10');
    await page.details.learningMaterials.manager.startTime.timePicker.minute.select('10');
    await page.details.learningMaterials.manager.startTime.timePicker.ampm.select('AM');

    await page.details.learningMaterials.manager.addEndDate();
    await page.details.learningMaterials.manager.endDate.datePicker.set(newDate.toJSDate());
    await page.details.learningMaterials.manager.endTime.timePicker.hour.select('10');
    await page.details.learningMaterials.manager.endTime.timePicker.minute.select('10');
    await page.details.learningMaterials.manager.endTime.timePicker.ampm.select('AM');
    await page.details.learningMaterials.manager.save();

    assert.ok(page.details.learningMaterials.manager.hasEndDateValidationError);
    const formattedDate = this.intl.formatDate(newDate.toJSDate(), {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    assert.strictEqual(
      page.details.learningMaterials.manager.timedReleaseSummary,
      `(Available: ${formattedDate} until ${formattedDate})`,
    );
  });

  test('edit learning material with no other links #3617', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    const newTitle = 'text text. Woo hoo!';

    await page.visit({ courseId: this.course.id, sessionId: 1 });
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
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    assert.notOk(page.details.learningMaterials.manager.hasTitleValidationError);
    await page.details.learningMaterials.manager.name.fillIn('a');
    await page.details.learningMaterials.manager.save();
    assert.ok(page.details.learningMaterials.manager.hasTitleValidationError);
  });

  test('title too long', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
    assert.notOk(page.details.learningMaterials.current[0].isTimedRelease);
    await page.details.learningMaterials.current[0].details();
    assert.notOk(page.details.learningMaterials.manager.hasTitleValidationError);
    await page.details.learningMaterials.manager.name.fillIn('0123456789'.repeat(13));
    await page.details.learningMaterials.manager.save();
    assert.ok(page.details.learningMaterials.manager.hasTitleValidationError);
  });

  test('missing copyright info #1204', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    await page.visit({ courseId: this.course.id, sessionId: 1 });
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

  test('list double linked learning materials', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
    });
    this.server.create('session-learning-material', {
      learningMaterial: this.material1,
      session,
      required: false,
      position: 0,
    });

    assert.expect(9);
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    assert.strictEqual(currentRouteName(), 'session.index');

    assert.strictEqual(page.details.learningMaterials.current.length, 1);

    assert.strictEqual(page.details.learningMaterials.current[0].title, 'learning material 0');
    assert.strictEqual(
      page.details.learningMaterials.current[0].userNameInfo.fullName,
      '0 guy M. Mc0son',
    );
    assert.notOk(page.details.learningMaterials.current[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(page.details.learningMaterials.current[0].required, 'No');
    assert.strictEqual(page.details.learningMaterials.current[0].notes, 'No');
    assert.notOk(page.details.learningMaterials.current[0].isNotePublic);
    assert.strictEqual(page.details.learningMaterials.current[0].status, 'status 0');
  });

  test('view double linked learning material details', async function (assert) {
    const session = this.server.create('session', {
      course: this.course,
    });
    this.server.create('session-learning-material', {
      learningMaterial: this.material1,
      session,
      required: false,
      position: 0,
    });
    await page.visit({ courseId: this.course.id, sessionId: session.id });
    assert.strictEqual(page.details.learningMaterials.current.length, 1);
    await page.details.learningMaterials.current[0].details();

    assert.strictEqual(page.details.learningMaterials.manager.nameValue, 'learning material 0');
    assert.notOk(page.details.learningMaterials.manager.name.isPresent);
    assert.strictEqual(page.details.learningMaterials.manager.author, 'Jennifer Johnson');
    assert.strictEqual(
      page.details.learningMaterials.manager.description.value,
      '0 lm description',
    );
    assert.ok(page.details.learningMaterials.manager.hasFile);
    assert.ok(page.details.learningMaterials.manager.hasCopyrightPermission);
    assert.strictEqual(page.details.learningMaterials.manager.copyrightPermission, 'Yes');
    assert.notOk(page.details.learningMaterials.manager.hasCopyrightRationale);
    assert.notOk(page.details.learningMaterials.manager.hasLink);
    assert.notOk(page.details.learningMaterials.manager.hasCitation);
  });
});
