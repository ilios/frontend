import { resolve } from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | new myreport', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(35);
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
    const schools = 'select:nth-of-type(1)';
    const schoolOptions = `${schools} option`;
    const allSchools = `${schoolOptions}:nth-of-type(1)`;
    const firstSchool = `${schoolOptions}:nth-of-type(2)`;
    const secondSchool = `${schoolOptions}:nth-of-type(3)`;
    const thirdSchool = `${schoolOptions}:nth-of-type(4)`;

    const subjects = 'select:nth-of-type(2) option';
    const firstSubject = `${subjects}:nth-of-type(1)`;
    const secondSubject = `${subjects}:nth-of-type(2)`;
    const thirdSubject = `${subjects}:nth-of-type(3)`;
    const fourthSubject = `${subjects}:nth-of-type(4)`;
    const fifthSubject = `${subjects}:nth-of-type(5)`;
    const sixthSubject = `${subjects}:nth-of-type(6)`;
    const seventhSubject = `${subjects}:nth-of-type(7)`;
    const eighthSubject = `${subjects}:nth-of-type(8)`;
    const ninthSubject = `${subjects}:nth-of-type(9)`;
    const tenthSubject = `${subjects}:nth-of-type(10)`;
    const eleventhSubject = `${subjects}:nth-of-type(11)`;

    await settled();
    assert.equal(find(title).textContent, 'New Report');
    assert.notEqual(find(allSchools).text().search(/All Schools/), -1);
    assert.equal(find(allSchools).val(), "null");
    assert.ok(find(allSchools).not(':selected'), 'all schools is not selected');
    assert.notEqual(find(firstSchool).text().search(/first/), -1);
    assert.equal(find(firstSchool).val(), 1);
    assert.ok(find(firstSchool).not(':selected'), 'first school is not selected');
    assert.notEqual(find(secondSchool).text().search(/second/), -1);
    assert.equal(find(secondSchool).val(), 2);
    assert.ok(find(secondSchool).is(':selected'), 'users primary school is selected');
    assert.notEqual(find(thirdSchool).text().search(/third/), -1);
    assert.equal(find(thirdSchool).val(), 3);
    assert.ok(find(thirdSchool).not(':selected'), 'third school is not selected');

    assert.equal(find(firstSubject).textContent.trim(), 'Courses');
    assert.equal(find(firstSubject).val(), 'course');
    assert.equal(find(secondSubject).textContent.trim(), 'Sessions');
    assert.equal(find(secondSubject).val(), 'session');
    assert.equal(find(thirdSubject).textContent.trim(), 'Programs');
    assert.equal(find(thirdSubject).val(), 'program');
    assert.equal(find(fourthSubject).textContent.trim(), 'Program Years');
    assert.equal(find(fourthSubject).val(), 'program year');
    assert.equal(find(fifthSubject).textContent.trim(), 'Instructors');
    assert.equal(find(fifthSubject).val(), 'instructor');
    assert.equal(find(sixthSubject).textContent.trim(), 'Instructor Groups');
    assert.equal(find(sixthSubject).val(), 'instructor group');
    assert.equal(find(seventhSubject).textContent.trim(), 'Learning Materials');
    assert.equal(find(seventhSubject).val(), 'learning material');
    assert.equal(find(eighthSubject).textContent.trim(), 'Competencies');
    assert.equal(find(eighthSubject).val(), 'competency');
    assert.equal(find(ninthSubject).textContent.trim(), 'MeSH Terms');
    assert.equal(find(ninthSubject).val(), 'mesh term');
    assert.equal(find(tenthSubject).textContent.trim(), 'Terms');
    assert.equal(find(tenthSubject).val(), 'term');
    assert.equal(find(eleventhSubject).textContent.trim(), 'Session Types');
    assert.equal(find(eleventhSubject).val(), 'session type');
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

    const schoolSelect = `select:nth-of-type(1)`;
    const select = `select:nth-of-type(2)`;
    const subjects = `${select} option`;
    const targetSubject = `${subjects}:eq(${subjectNum})`;

    const objectsOptions = 'select:nth-of-type(3) option';

    await settled();
    context.$(schoolSelect).val(null).change();
    await settled();
    assert.equal(context.$(targetSubject).val(), subjectVal, `${subjectVal} is in the list where we expect it.`);
    context.$(select).val(subjectVal).change();
    await settled();

    assert.equal(context.$(`${objectsOptions}:nth-of-type(1)`).val(), '', 'first option is blank');
    expectedObjects.forEach((val, i) => {
      assert.equal(context.$(`${objectsOptions}:eq(${i+1})`).val(), val, `${val} is object option`);
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

    const schoolSelect = 'select:nth-of-type(1)';
    const subjects = `select:nth-of-type(2) option`;
    const objectSelect = 'select:nth-of-type(3)';
    const targetSubject = `${subjects}:nth-of-type(1)`;
    const targetObject = `instructor`;
    const userSearch = '.user-search';
    const input = `${userSearch} input`;
    const results = `${userSearch} li`;
    const firstResult = `${results}:nth-of-type(2)`;
    const selectedUser = `.removable-list`;

    this.set('close', ()=>{});
    await render(hbs`{{new-myreport close=(action close)}}`);
    await settled();
    find(schoolSelect).val(null).change();
    await settled();
    assert.equal(find(targetSubject).val(), 'course');
    find(objectSelect).val(targetObject).change();
    await settled();

    assert.equal(findAll(userSearch).length, 1);
    find(input).val('test').trigger('input');
    await settled();

    await find(firstResult).click();
    await settled();
    assert.equal(find(selectedUser).textContent.trim(), 'Test Person');

    await settled();
  });
});
