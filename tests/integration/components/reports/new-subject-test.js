import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/reports/new-subject';

module('Integration | Component | reports/new-subject', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  const checkObjects = async function (context, assert, subjectNum, subjectVal, expectedObjects) {
    const school = context.server.create('school', { title: 'first' });
    const user = context.server.create('user', { school });
    const userModel = await context.owner.lookup('service:store').findRecord('user', user.id);

    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    context.owner.register('service:current-user', CurrentUserMock);
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    assert.strictEqual(component.subjects.items[subjectNum].value, subjectVal);
    await component.subjects.choose(subjectVal);
    await component.objects.choose('null');
    assert.strictEqual(component.objects.items[0].value, '');
    expectedObjects.forEach((val, i) => {
      assert.strictEqual(component.objects.items[i + 1].value, val, `${val} is object option`);
    });
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

    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);

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
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    await component.objects.choose('mesh term');
    assert.notOk(component.selectedMeshTerm.isVisible);
    await component.mesh.manager.search.set('descriptor 0');
    await component.mesh.manager.searchResults[0].add();
    assert.strictEqual(component.selectedMeshTerm.name, 'descriptor 0');
    await component.selectedMeshTerm.remove();
    assert.notOk(component.selectedMeshTerm.isVisible);
  });

  test('selecting and de-selecting an instructor as prepositional object', async function (assert) {
    this.server.create('user', { firstName: 'Rusty' });
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);

    await component.objects.choose('instructor');
    assert.notOk(component.selectedInstructor.isVisible);
    await component.instructors.search.searchBox.set('Rusty');
    await component.instructors.search.results.items[0].click();
    assert.strictEqual(component.selectedInstructor.text, 'Rusty M. Mc0son');
    await component.selectedInstructor.remove();
    assert.notOk(component.selectedInstructor.isVisible);
  });

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
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    assert.notOk(component.instructors.search.isVisible);
    assert.notOk(component.selectedInstructor.isVisible);
    await component.schools.choose('null');
    await component.objects.choose('instructor');
    assert.ok(component.instructors.search.isVisible);
    await component.instructors.search.searchBox.set('test');
    await component.instructors.search.results.items[0].click();
    assert.strictEqual(component.selectedInstructor.text, 'Aardvark');
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
    await render(hbs`<Reports::NewSubject @close={{this.close}} />
`);
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
    this.set('save', {
      perform(report) {
        assert.strictEqual(report.title, 'lorem ipsum');
      },
    });
    await render(hbs`<Reports::NewSubject @save={{this.save}} @close={{(noop)}} />
`);
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
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
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
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    await component.objects.choose('instructor');
    assert.strictEqual(component.instructors.errors.length, 0);
    await component.save();
    assert.strictEqual(component.instructors.errors.length, 1);
    assert.strictEqual(component.instructors.errors[0].text, 'Instructor is Required');
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
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    await component.objects.choose('mesh term');
    assert.strictEqual(component.mesh.errors.length, 0);
    await component.save();
    assert.strictEqual(component.mesh.errors.length, 1);
    assert.strictEqual(component.mesh.errors[0].text, 'MeSH Term is Required');
  });

  test('missing object for MeSH term', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    await component.subjects.choose('mesh term');
    assert.strictEqual(component.objects.errors.length, 0);
    await component.save();
    assert.strictEqual(component.objects.errors.length, 1);
    assert.strictEqual(
      component.objects.errors[0].text,
      'Association is required when MeSH Term is the subject'
    );
  });

  test('missing object for instructor', async function (assert) {
    const school = this.server.create('school', { title: 'first' });
    const user = this.server.create('user', { school });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }
    this.owner.register('service:current-user', CurrentUserMock);
    await render(hbs`<Reports::NewSubject @close={{(noop)}} />
`);
    await component.subjects.choose('instructor');
    assert.strictEqual(component.objects.errors.length, 0);
    await component.save();
    assert.strictEqual(component.objects.errors.length, 1);
    assert.strictEqual(
      component.objects.errors[0].text,
      'Association is required when Instructor is the subject'
    );
  });
});
