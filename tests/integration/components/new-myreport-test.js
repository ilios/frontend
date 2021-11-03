import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, click, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | new myreport', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(33);
    this.server.create('school', { title: 'first' });
    const school2 = this.server.create('school', { title: 'second' });
    this.server.create('school', { title: 'third' });

    //pre-fetch schools this is usually done at the route above this component, but
    // for this integration test we need to do this here
    await this.owner.lookup('service:store').findAll('school');

    const user = this.server.create('user', { school: school2 });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);

    this.set('close', () => {});
    await render(hbs`<NewMyreport @close={{action close}} />`);
    const title = '.title';
    const schools = '[data-test-school] select';
    const subjects = '[data-test-subject] select';

    const schoolSelect = find(schools);
    assert.dom(title).hasText('New Report');
    assert.ok(schoolSelect.options[0].value, 'null');
    assert.ok(schoolSelect.options[0].textContent.includes('All Schools'));
    assert.ok(schoolSelect.options[1].value, '1');
    assert.ok(schoolSelect.options[1].textContent.includes('first'));
    assert.ok(schoolSelect.options[2].value, '2');
    assert.ok(schoolSelect.options[2].textContent.includes('second'));
    assert.ok(schoolSelect.options[3].value, '3');
    assert.ok(schoolSelect.options[3].textContent.includes('third'));
    assert.strictEqual(
      schoolSelect.options[schoolSelect.selectedIndex].value,
      2,
      'primary school is selected'
    );

    const subjectSelect = find(subjects);
    assert.ok(subjectSelect.options[0].value, 'course');
    assert.ok(subjectSelect.options[0].textContent.includes('Courses'));
    assert.ok(subjectSelect.options[1].value, 'session');
    assert.ok(subjectSelect.options[1].textContent.includes('Sessions'));
    assert.ok(subjectSelect.options[2].value, 'program');
    assert.ok(subjectSelect.options[2].textContent.includes('Programs'));
    assert.ok(subjectSelect.options[3].value, 'program year');
    assert.ok(subjectSelect.options[3].textContent.includes('Program Years'));
    assert.ok(subjectSelect.options[4].value, 'instructor');
    assert.ok(subjectSelect.options[4].textContent.includes('Instructors'));
    assert.ok(subjectSelect.options[5].value, 'instructor group');
    assert.ok(subjectSelect.options[5].textContent.includes('Instructor Groups'));
    assert.ok(subjectSelect.options[6].value, 'learning material');
    assert.ok(subjectSelect.options[6].textContent.includes('Learning Materials'));
    assert.ok(subjectSelect.options[7].value, 'competency');
    assert.ok(subjectSelect.options[7].textContent.includes('Competencies'));
    assert.ok(subjectSelect.options[8].value, 'mesh term');
    assert.ok(subjectSelect.options[8].textContent.includes('MeSH Terms'));
    assert.ok(subjectSelect.options[9].value, 'term');
    assert.ok(subjectSelect.options[9].textContent.includes('Terms'));
    assert.ok(subjectSelect.options[10].value, 'session type');
    assert.ok(subjectSelect.options[10].textContent.includes('Session Types'));
    assert.strictEqual(
      subjectSelect.options[subjectSelect.selectedIndex].value,
      'course',
      'courses is selected'
    );
  });

  const checkObjects = async function (context, assert, subjectNum, subjectVal, expectedObjects) {
    const school = context.server.create('school', { title: 'first' });
    const user = context.server.create('user', { school });
    const userModel = await context.owner.lookup('service:store').find('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    context.owner.register('service:current-user', CurrentUserMock);
    context.set('close', () => {});
    await render(hbs`<NewMyreport @close={{action close}} />`);

    const subject = `[data-test-subject] select`;
    const object = `[data-test-object] select`;
    await fillIn('[data-test-school] select', 'null');
    const subjectSelect = find(subject);
    assert.strictEqual(subjectSelect.options[subjectNum].value, subjectVal);
    await fillIn(subjectSelect, subjectVal);

    const objectSelect = find(object);
    assert.strictEqual(objectSelect.options[0].value, '');
    expectedObjects.forEach((val, i) => {
      assert.strictEqual(objectSelect.options[i + 1].value, val, `${val} is object option`);
    });
  };

  test('choosing course selects correct objects', function (assert) {
    assert.expect(8);
    return checkObjects(this, assert, 0, 'course', [
      'program',
      'instructor',
      'instructor group',
      'learning material',
      'competency',
      'mesh term',
    ]);
  });

  test('choosing session selects correct objects', function (assert) {
    assert.expect(10);
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

  test('choosing programs selects correct objects', function (assert) {
    assert.expect(4);
    return checkObjects(this, assert, 2, 'program', ['course', 'session']);
  });

  test('choosing program years selects correct objects', function (assert) {
    assert.expect(4);
    return checkObjects(this, assert, 3, 'program year', ['course', 'session']);
  });

  test('choosing instructor selects correct objects', function (assert) {
    assert.expect(7);
    return checkObjects(this, assert, 4, 'instructor', [
      'course',
      'session',
      'instructor group',
      'learning material',
      'session type',
    ]);
  });

  test('choosing instructor group selects correct objects', function (assert) {
    assert.expect(7);
    return checkObjects(this, assert, 5, 'instructor group', [
      'course',
      'session',
      'instructor',
      'learning material',
      'session type',
    ]);
  });

  test('choosing learning material selects correct objects', function (assert) {
    assert.expect(8);
    return checkObjects(this, assert, 6, 'learning material', [
      'course',
      'session',
      'instructor',
      'instructor group',
      'mesh term',
      'session type',
    ]);
  });

  test('choosing competency selects correct objects', function (assert) {
    assert.expect(5);
    return checkObjects(this, assert, 7, 'competency', ['course', 'session', 'session type']);
  });

  test('choosing mesh term selects correct objects', function (assert) {
    assert.expect(6);
    return checkObjects(this, assert, 8, 'mesh term', [
      'course',
      'session',
      'learning material',
      'session type',
    ]);
  });

  test('choosing term selects correct objects', function (assert) {
    assert.expect(10);
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

  test('choosing session type selects correct objects', function (assert) {
    assert.expect(10);
    return checkObjects(this, assert, 10, 'session type', [
      'course',
      'program',
      'instructor',
      'instructor group',
      'learning material',
      'competency',
      'mesh term',
      'term',
    ]);
  });

  test('can search for user #2506', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').find('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);
    this.server.create('user', {
      firstName: 'Test',
      lastName: 'Person',
      middleName: '',
      email: 'test@example.com',
      displayName: 'Aardvark',
    });

    const schoolSelect = '[data-test-school] select';
    const subject = `[data-test-subject] select`;
    const object = `[data-test-object] select`;
    const userSearch = '.user-search';
    const input = `${userSearch} input`;
    const results = `${userSearch} li`;
    const firstResult = `${results}:nth-of-type(2)`;
    const selectedUser = `.removable-list li:nth-of-type(1)`;

    this.set('close', () => {});
    await render(hbs`<NewMyreport @close={{action close}} />`);
    await fillIn(schoolSelect, 'null');
    const subjectSelect = find(subject);
    assert.strictEqual(subjectSelect.options[subjectSelect.selectedIndex].value, 'course');
    await fillIn(object, 'instructor');
    assert.dom(userSearch).exists({ count: 1 });
    await fillIn(input, 'test');
    await click(firstResult);
    assert.dom(selectedUser).hasText('Aardvark');
  });
});
