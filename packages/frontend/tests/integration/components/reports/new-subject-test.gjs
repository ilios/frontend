import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/new-subject';
import NewSubject from 'frontend/components/reports/new-subject';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/new-subject', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const checkObjects = async function (context, assert, subjectNum, subjectVal, expectedObjects) {
    const school = context.server.create('school', { title: 'first' });
    const user = context.server.create('user', { school });
    const userModel = await context.owner.lookup('service:store').findRecord('user', user.id);
    const exceptedSubjects = ['instructor', 'mesh term'];
    context.set('selectedSubject', null);
    context.set('setSelectedSubject', (subject) => {
      context.set('selectedSubject', subject);
      assert.strictEqual(context.selectedSubject, subject, 'selected subject is correct');
    });
    context.set('selectedPrepositionalObject', null);
    context.set('setSelectedPrepositionalObject', (object) => {
      context.set('selectedPrepositionalObject', object);
      assert.strictEqual(
        context.selectedPrepositionalObject,
        object,
        'selected prepositional object is correct',
      );
    });
    context.set('selectedPrepositionalObjectId', null);
    context.set('setSelectedPrepositionalObjectId', (id) => {
      context.set('selectedPrepositionalObjectId', id);
      assert.strictEqual(
        context.selectedPrepositionalObjectId,
        id,
        'selected prepositional object id is correct',
      );
    });

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    context.owner.register('service:current-user', CurrentUserMock);
    await render(
      <template>
        <NewSubject
          @close={{(noop)}}
          @setSelectedSchoolId={{(noop)}}
          @selectedSubject={{context.selectedSubject}}
          @setSelectedSubject={{context.setSelectedSubject}}
          @selectedPrepositionalObject={{context.selectedPrepositionalObject}}
          @setSelectedPrepositionalObject={{context.setSelectedPrepositionalObject}}
          @selectedPrepositionalObjectId={{context.selectedPrepositionalObjectId}}
          @setSelectedPrepositionalObjectId={{context.setSelectedPrepositionalObjectId}}
        />
      </template>,
    );
    assert.strictEqual(
      component.subjects.items[subjectNum].value,
      subjectVal,
      'subject dropdown value is correct',
    );
    await component.subjects.choose(subjectVal);
    await component.objects.choose('null');
    if (!exceptedSubjects.includes(subjectVal)) {
      assert.strictEqual(component.objects.items[0].value, '', '"Anything" is first object option');
      expectedObjects.forEach((val, i) => {
        assert.strictEqual(
          component.objects.items[i + 1].value,
          val,
          `${val} is next object option`,
        );
      });
    } else {
      expectedObjects.forEach((val, i) => {
        assert.strictEqual(component.objects.items[i].value, val, `${val} is next object option`);
      });
    }
  };

  test('it renders', async function (assert) {
    this.server.create('school', { title: 'first' });
    const school2 = this.server.create('school', { title: 'second' });
    this.server.create('school', { title: 'third' });
    //pre-fetch schools this is usually done at the route above this component, but
    // for this integration test we need to do this here
    await this.owner.lookup('service:store').findAll('school');
    const user = this.server.create('user', { school: school2 });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);

    await render(<template><NewSubject @close={{(noop)}} /></template>);

    assert.strictEqual(component.componentTitle, 'New Report');
    assert.strictEqual(component.schools.items.length, 4);
    assert.strictEqual(component.schools.items[0].value, 'null');
    assert.strictEqual(component.schools.items[0].text, 'All Schools');
    assert.notOk(component.schools.items[0].isSelected);
    assert.strictEqual(component.schools.items[1].value, '1');
    assert.strictEqual(component.schools.items[1].text, 'first');
    assert.notOk(component.schools.items[1].isSelected);
    assert.strictEqual(component.schools.items[2].value, '2');
    assert.strictEqual(component.schools.items[2].text, 'second');
    assert.ok(component.schools.items[2].isSelected);
    assert.strictEqual(component.schools.items[3].value, '3');
    assert.strictEqual(component.schools.items[3].text, 'third');
    assert.notOk(component.schools.items[3].isSelected);
    assert.strictEqual(component.subjects.items.length, 11);
    assert.strictEqual(component.subjects.items[0].value, 'course');
    assert.strictEqual(component.subjects.items[0].text, 'Courses');
    assert.ok(component.subjects.items[0].isSelected);
    assert.strictEqual(component.subjects.items[1].value, 'session');
    assert.strictEqual(component.subjects.items[1].text, 'Sessions');
    assert.notOk(component.subjects.items[1].isSelected);
    assert.strictEqual(component.subjects.items[2].value, 'program');
    assert.strictEqual(component.subjects.items[2].text, 'Programs');
    assert.notOk(component.subjects.items[2].isSelected);
    assert.strictEqual(component.subjects.items[3].value, 'program year');
    assert.strictEqual(component.subjects.items[3].text, 'Program Years');
    assert.notOk(component.subjects.items[3].isSelected);
    assert.strictEqual(component.subjects.items[4].value, 'instructor');
    assert.strictEqual(component.subjects.items[4].text, 'Instructors');
    assert.notOk(component.subjects.items[4].isSelected);
    assert.strictEqual(component.subjects.items[5].value, 'instructor group');
    assert.strictEqual(component.subjects.items[5].text, 'Instructor Groups');
    assert.notOk(component.subjects.items[5].isSelected);
    assert.strictEqual(component.subjects.items[6].value, 'learning material');
    assert.strictEqual(component.subjects.items[6].text, 'Learning Materials');
    assert.notOk(component.subjects.items[6].isSelected);
    assert.strictEqual(component.subjects.items[7].value, 'competency');
    assert.strictEqual(component.subjects.items[7].text, 'Competencies');
    assert.notOk(component.subjects.items[7].isSelected);
    assert.strictEqual(component.subjects.items[8].value, 'mesh term');
    assert.strictEqual(component.subjects.items[8].text, 'MeSH Terms');
    assert.notOk(component.subjects.items[8].isSelected);
    assert.strictEqual(component.subjects.items[9].value, 'term');
    assert.strictEqual(component.subjects.items[9].text, 'Terms');
    assert.notOk(component.subjects.items[9].isSelected);
    assert.strictEqual(component.subjects.items[10].value, 'session type');
    assert.strictEqual(component.subjects.items[10].text, 'Session Types');
    assert.notOk(component.subjects.items[10].isSelected);
  });

  test('selecting and de-selecting a MeSH term as prepositional object', async function (assert) {
    this.server.create('mesh-descriptor');
    this.set('selectedPrepositionalObject', null);
    this.set('setSelectedPrepositionalObject', (object) => {
      this.set('selectedPrepositionalObject', object);
      assert.strictEqual(
        this.selectedPrepositionalObject,
        object,
        'prepositional object is correct',
      );
    });
    this.set('selectedPrepositionalObjectId', null);
    this.set('setSelectedPrepositionalObjectId', (id) => {
      this.set('selectedPrepositionalObjectId', id);
      assert.strictEqual(
        this.selectedPrepositionalObjectId,
        id,
        'prepositional object id is correct',
      );
    });
    await render(
      <template>
        <NewSubject
          @close={{(noop)}}
          @selectedPrepositionalObject={{this.selectedPrepositionalObject}}
          @setSelectedPrepositionalObject={{this.setSelectedPrepositionalObject}}
          @selectedPrepositionalObjectId={{this.selectedPrepositionalObjectId}}
          @setSelectedPrepositionalObjectId={{this.setSelectedPrepositionalObjectId}}
        />
      </template>,
    );
    await component.objects.choose('mesh term');
    assert.notOk(component.meshTerm.hasSelectedTerm, 'no mesh term selected');
    await component.meshTerm.meshManager.search.set('descriptor 0');
    await component.meshTerm.meshManager.searchResults[0].add();
    assert.strictEqual(
      component.meshTerm.selectedTerm,
      'descriptor 0',
      'selected mesh term is correct',
    );
    await component.meshTerm.removeSelectedTerm();
    assert.notOk(component.meshTerm.hasSelectedTerm, 'no mesh term selected');
  });

  test('selecting and de-selecting an instructor as prepositional object', async function (assert) {
    this.server.create('user', { firstName: 'Rusty' });
    this.set('selectedPrepositionalObject', null);
    this.set('setSelectedPrepositionalObject', (object) => {
      this.set('selectedPrepositionalObject', object);
      assert.strictEqual(
        this.selectedPrepositionalObject,
        object,
        'prepositional object is correct',
      );
    });
    this.set('selectedPrepositionalObjectId', null);
    this.set('setSelectedPrepositionalObjectId', (id) => {
      this.set('selectedPrepositionalObjectId', id);
      assert.strictEqual(
        this.selectedPrepositionalObjectId,
        id,
        'prepositional object id is correct',
      );
    });
    await render(
      <template>
        <NewSubject
          @close={{(noop)}}
          @selectedPrepositionalObject={{this.selectedPrepositionalObject}}
          @setSelectedPrepositionalObject={{this.setSelectedPrepositionalObject}}
          @selectedPrepositionalObjectId={{this.selectedPrepositionalObjectId}}
          @setSelectedPrepositionalObjectId={{this.setSelectedPrepositionalObjectId}}
        />
      </template>,
    );

    await component.objects.choose('instructor');
    assert.notOk(component.instructor.hasSelectedInstructor);
    await component.instructor.userSearch.searchBox.set('Rusty');
    await component.instructor.userSearch.results.items[0].click();
    assert.strictEqual(component.instructor.selectedInstructor, 'Rusty M. Mc0son');
    await component.instructor.removeSelectedInstructor();
    assert.notOk(component.instructor.hasSelectedInstructor);
  });

  test('choosing course selects correct objects', function (assert) {
    assert.expect(15);
    return checkObjects(this, assert, 0, 'course', [
      'academic year',
      'competency',
      'instructor',
      'instructor group',
      'learning material',
      'mesh term',
      'program',
      'program year',
    ]);
  });

  test('choosing session selects correct objects', function (assert) {
    assert.expect(16);
    return checkObjects(this, assert, 1, 'session', [
      'academic year',
      'competency',
      'course',
      'instructor',
      'instructor group',
      'learning material',
      'mesh term',
      'program',
      'session type',
    ]);
  });

  test('choosing programs selects correct objects', function (assert) {
    assert.expect(9);
    return checkObjects(this, assert, 2, 'program', ['course', 'session']);
  });

  test('choosing program years selects correct objects', function (assert) {
    assert.expect(9);
    return checkObjects(this, assert, 3, 'program year', ['course', 'session']);
  });

  test('choosing instructor selects correct objects', function (assert) {
    assert.expect(12);
    return checkObjects(this, assert, 4, 'instructor', [
      'academic year',
      'course',
      'instructor group',
      'learning material',
      'session',
      'session type',
    ]);
  });

  test('choosing instructor group selects correct objects', function (assert) {
    assert.expect(13);
    return checkObjects(this, assert, 5, 'instructor group', [
      'academic year',
      'course',
      'instructor',
      'learning material',
      'session',
      'session type',
    ]);
  });

  test('choosing learning material selects correct objects', function (assert) {
    assert.expect(13);
    return checkObjects(this, assert, 6, 'learning material', [
      'course',
      'instructor',
      'instructor group',
      'mesh term',
      'session',
      'session type',
    ]);
  });

  test('choosing competency selects correct objects', function (assert) {
    assert.expect(11);
    return checkObjects(this, assert, 7, 'competency', [
      'academic year',
      'course',
      'session',
      'session type',
    ]);
  });

  test('choosing mesh term selects correct objects', function (assert) {
    assert.expect(10);
    return checkObjects(this, assert, 8, 'mesh term', [
      'course',
      'learning material',
      'session',
      'session type',
    ]);
  });

  test('choosing term selects correct objects', function (assert) {
    assert.expect(15);
    return checkObjects(this, assert, 9, 'term', [
      'academic year',
      'competency',
      'course',
      'instructor',
      'learning material',
      'program',
      'program year',
      'session',
    ]);
  });

  test('choosing session type selects correct objects', function (assert) {
    assert.expect(16);
    return checkObjects(this, assert, 10, 'session type', [
      'academic year',
      'competency',
      'course',
      'instructor',
      'instructor group',
      'learning material',
      'mesh term',
      'program',
      'term',
    ]);
  });

  test('can search for user #2506', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
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
    this.set('selectedPrepositionalObject', null);
    this.set('setSelectedPrepositionalObject', (object) => {
      this.set('selectedPrepositionalObject', object);
      assert.strictEqual(
        this.selectedPrepositionalObject,
        object,
        'prepositional object is correct',
      );
    });
    this.set('selectedPrepositionalObjectId', null);
    this.set('setSelectedPrepositionalObjectId', (id) => {
      this.set('selectedPrepositionalObjectId', id);
      assert.strictEqual(
        this.selectedPrepositionalObjectId,
        id,
        'prepositional object id is correct',
      );
    });
    await render(
      <template>
        <NewSubject
          @close={{(noop)}}
          @setSelectedSchoolId={{(noop)}}
          @setSelectedSchool={{(noop)}}
          @selectedPrepositionalObject={{this.selectedPrepositionalObject}}
          @setSelectedPrepositionalObject={{this.setSelectedPrepositionalObject}}
          @selectedPrepositionalObjectId={{this.selectedPrepositionalObjectId}}
          @setSelectedPrepositionalObjectId={{this.setSelectedPrepositionalObjectId}}
        />
      </template>,
    );
    assert.notOk(component.instructor.userSearch.isVisible);
    assert.notOk(component.instructor.hasSelectedInstructor);
    await component.schools.choose('null');
    await component.objects.choose('instructor');
    assert.ok(component.instructor.userSearch.isVisible);
    await component.instructor.userSearch.searchBox.set('test');
    await component.instructor.userSearch.results.items[0].click();
    assert.strictEqual(component.instructor.selectedInstructor, 'Aardvark');
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    this.set('close', () => {
      assert.ok(true);
    });
    await render(<template><NewSubject @close={{this.close}} /></template>);
    await component.cancel();
  });

  test('save', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    this.set('save', (report) => {
      assert.strictEqual(report.title, 'lorem ipsum');
    });
    await render(<template><NewSubject @save={{this.save}} @close={{(noop)}} /></template>);
    await component.title.set('lorem ipsum');
    await component.save();
  });

  test('title too long', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    await render(<template><NewSubject @close={{(noop)}} /></template>);
    assert.strictEqual(component.title.errors.length, 0);
    await component.title.set('0123456789'.repeat(25));
    await component.save();
    assert.strictEqual(component.title.errors.length, 1);
  });

  test('instructor missing', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    this.set('selectedPrepositionalObject', null);
    this.set('setSelectedPrepositionalObject', (object) => {
      this.set('selectedPrepositionalObject', object);
      assert.strictEqual(
        this.selectedPrepositionalObject,
        object,
        'prepositional object is correct',
      );
    });
    this.set('selectedPrepositionalObjectId', null);
    this.set('setSelectedPrepositionalObjectId', (id) => {
      this.set('selectedPrepositionalObjectId', id);
      assert.strictEqual(
        this.selectedPrepositionalObjectId,
        id,
        'prepositional object id is correct',
      );
    });
    await render(
      <template>
        <NewSubject
          @close={{(noop)}}
          @selectedPrepositionalObject={{this.selectedPrepositionalObject}}
          @setSelectedPrepositionalObject={{this.setSelectedPrepositionalObject}}
          @selectedPrepositionalObjectId={{this.selectedPrepositionalObjectId}}
          @setSelectedPrepositionalObjectId={{this.setSelectedPrepositionalObjectId}}
        />
      </template>,
    );
    await component.objects.choose('instructor');
    assert.strictEqual(component.errors.length, 0);
    await component.save();
    assert.strictEqual(component.errors.length, 1);
    assert.strictEqual(component.errors[0].text, 'Instructor is Required');
  });

  test('missing MeSH term', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    this.set('selectedPrepositionalObject', null);
    this.set('setSelectedPrepositionalObject', (object) => {
      this.set('selectedPrepositionalObject', object);
      assert.strictEqual(
        this.selectedPrepositionalObject,
        object,
        'prepositional object is correct',
      );
    });
    this.set('selectedPrepositionalObjectId', null);
    this.set('setSelectedPrepositionalObjectId', (id) => {
      this.set('selectedPrepositionalObjectId', id);
      assert.strictEqual(
        this.selectedPrepositionalObjectId,
        id,
        'prepositional object id is correct',
      );
    });
    await render(
      <template>
        <NewSubject
          @close={{(noop)}}
          @selectedPrepositionalObject={{this.selectedPrepositionalObject}}
          @setSelectedPrepositionalObject={{this.setSelectedPrepositionalObject}}
          @selectedPrepositionalObjectId={{this.selectedPrepositionalObjectId}}
          @setSelectedPrepositionalObjectId={{this.setSelectedPrepositionalObjectId}}
        />
      </template>,
    );
    await component.objects.choose('mesh term');
    assert.strictEqual(component.errors.length, 0);
    await component.save();
    assert.strictEqual(component.errors.length, 1);
    assert.strictEqual(component.errors[0].text, 'MeSH Term is Required');
  });
});
