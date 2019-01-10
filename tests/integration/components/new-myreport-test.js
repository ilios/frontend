import { resolve } from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  find,
  click,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | new myreport', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(33);
    this.server.create('school', { title: 'first' });
    const school2 = this.server.create('school', { title: 'second' });
    this.server.create('school', { title: 'third' });

    const mockUser = EmberObject.create({
      school: resolve(school2)
    });

    const currentUserMock = Service.extend({
      model: resolve(mockUser)
    });
    this.owner.register('service:current-user', currentUserMock);


    this.set('close', ()=>{});
    await render(hbs`{{new-myreport close=(action close)}}`);
    const title = '.title';
    const schools = '[data-test-school] select';
    const subjects = '[data-test-subject] select';

    const schoolSelect = find(schools);
    assert.dom(title).hasText('New Report');
    assert.ok(schoolSelect.options[0].value, "null");
    assert.ok(schoolSelect.options[0].textContent.includes('All Schools'));
    assert.ok(schoolSelect.options[1].value, "1");
    assert.ok(schoolSelect.options[1].textContent.includes('first'));
    assert.ok(schoolSelect.options[2].value, "2");
    assert.ok(schoolSelect.options[2].textContent.includes('second'));
    assert.ok(schoolSelect.options[3].value, "3");
    assert.ok(schoolSelect.options[3].textContent.includes('third'));
    assert.equal(schoolSelect.options[schoolSelect.selectedIndex].value, 2, 'primary school is selected');

    const subjectSelect = find(subjects);
    assert.ok(subjectSelect.options[0].value, "course");
    assert.ok(subjectSelect.options[0].textContent.includes('Courses'));
    assert.ok(subjectSelect.options[1].value, "session");
    assert.ok(subjectSelect.options[1].textContent.includes('Sessions'));
    assert.ok(subjectSelect.options[2].value, "program");
    assert.ok(subjectSelect.options[2].textContent.includes('Programs'));
    assert.ok(subjectSelect.options[3].value, "program year");
    assert.ok(subjectSelect.options[3].textContent.includes('Program Years'));
    assert.ok(subjectSelect.options[4].value, "instructor");
    assert.ok(subjectSelect.options[4].textContent.includes('Instructors'));
    assert.ok(subjectSelect.options[5].value, "instructor group");
    assert.ok(subjectSelect.options[5].textContent.includes('Instructor Groups'));
    assert.ok(subjectSelect.options[6].value, "learning material");
    assert.ok(subjectSelect.options[6].textContent.includes('Learning Materials'));
    assert.ok(subjectSelect.options[7].value, "competency");
    assert.ok(subjectSelect.options[7].textContent.includes('Competencies'));
    assert.ok(subjectSelect.options[8].value, "mesh term");
    assert.ok(subjectSelect.options[8].textContent.includes('MeSH Terms'));
    assert.ok(subjectSelect.options[9].value, "term");
    assert.ok(subjectSelect.options[9].textContent.includes('Terms'));
    assert.ok(subjectSelect.options[10].value, "session type");
    assert.ok(subjectSelect.options[10].textContent.includes('Session Types'));
    assert.equal(subjectSelect.options[subjectSelect.selectedIndex].value, 'course', 'courses is selected');
  });

  let checkObjects = async function(context, assert, subjectNum, subjectVal, expectedObjects){
    assert.expect(expectedObjects.length + 2);
    const school = context.server.create('school', { title: 'first' });
    const mockUser = EmberObject.create({
      school: resolve(school)
    });

    const currentUserMock = Service.extend({
      model: resolve(mockUser)
    });
    context.owner.register('service:current-user', currentUserMock);
    context.set('close', ()=>{});
    await render(hbs`{{new-myreport close=(action close)}}`);

    const subject = `[data-test-subject] select`;
    const object = `[data-test-object] select`;
    await fillIn('[data-test-school] select', 'null');
    const subjectSelect = find(subject);
    assert.equal(subjectSelect.options[subjectNum].value, subjectVal);
    await fillIn(subjectSelect, subjectVal);

    const objectSelect = find(object);
    assert.equal(objectSelect.options[0].value, '');
    expectedObjects.forEach((val, i) => {
      assert.equal(objectSelect.options[i + 1].value, val, `${val} is object option`);
    });
  };

  test('choosing course selects correct objects', function(assert) {
    return checkObjects(this, assert, 0, 'course', [
      'session',
      'program',
      'instructor',
      'instructor group',
      'learning material',
      'competency',
      'mesh term',
    ]);
  });

  test('choosing session selects correct objects', function(assert) {
    return checkObjects(this, assert, 1, 'session', [
      'course',
      'program',
      'instructor',
      'instructor group',
      'learning material',
      'competency',
      'mesh term',
      'session type',
    ]);
  });

  test('choosing programs selects correct objects', function(assert) {
    return checkObjects(this, assert, 2, 'program', ['course', 'session']);
  });

  test('choosing program years selects correct objects', function(assert) {
    return checkObjects(this, assert, 3, 'program year', ['course', 'session']);
  });

  test('choosing instructor selects correct objects', function(assert) {
    return checkObjects(this, assert, 4, 'instructor', [
      'course',
      'session',
      'instructor group',
      'learning material',
      'session type',
    ]);
  });

  test('choosing instructor group selects correct objects', function(assert) {
    return checkObjects(this, assert, 5, 'instructor group', [
      'course',
      'session',
      'instructor',
      'learning material',
      'session type',
    ]);
  });

  test('choosing learning material selects correct objects', function(assert) {
    return checkObjects(this, assert, 6, 'learning material', [
      'course',
      'session',
      'instructor',
      'instructor group',
      'mesh term',
      'session type',
    ]);
  });

  test('choosing competency selects correct objects', function(assert) {
    return checkObjects(this, assert, 7, 'competency', [
      'course',
      'session',
      'session type',
    ]);
  });

  test('choosing mesh term selects correct objects', function(assert) {
    return checkObjects(this, assert, 8, 'mesh term', [
      'course',
      'session',
      'learning material',
      'session type',
    ]);
  });

  test('choosing term selects correct objects', function(assert) {
    return checkObjects(this, assert, 9, 'term', [
      'course',
      'session',
      'program year',
      'program',
      'instructor',
      'learning material',
      'competency',
      'mesh term',
    ]);
  });

  test('choosing session type selects correct objects', function(assert) {
    return checkObjects(this, assert, 10, 'session type', [
      'course',
      'program',
      'instructor',
      'instructor group',
      'learning material',
      'competency',
      'mesh term',
      'term'
    ]);
  });


  test('can search for user #2506', async function(assert) {
    assert.expect(3);

    const school = this.server.create('school', { title: 'first' });
    const mockUser = EmberObject.create({
      school: resolve(school)
    });
    const currentUserMock = Service.extend({
      model: resolve(mockUser)
    });
    this.owner.register('service:current-user', currentUserMock);
    this.server.create('user', {
      firstName: 'Test',
      lastName: 'Person',
      middleName: '',
      email: 'test@example.com',
    });

    const schoolSelect = '[data-test-school] select';
    const subject = `[data-test-subject] select`;
    const object = `[data-test-object] select`;
    const userSearch = '.user-search';
    const input = `${userSearch} input`;
    const results = `${userSearch} li`;
    const firstResult = `${results}:nth-of-type(2)`;
    const selectedUser = `.removable-list`;

    this.set('close', ()=>{});
    await render(hbs`{{new-myreport close=(action close)}}`);
    await fillIn(schoolSelect, 'null');
    const subjectSelect = find(subject);
    assert.equal(subjectSelect.options[subjectSelect.selectedIndex].value, 'course');
    await fillIn(object, 'instructor');
    assert.dom(userSearch).exists({ count: 1 });
    await fillIn(input, 'test');
    await click(firstResult);
    assert.dom(selectedUser).hasText('Test Person');
  });
});
