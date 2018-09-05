import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | program list', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert){
    assert.expect(14);
    const program1 = EmberObject.create({
      id: 1,
      // KLUDGE!
      // see the comment on ProgramProxy::isDeletable() in the component file.
      hasMany() {
        return {
          ids() {
            return [ 1 ];
          }
        };
      },
      title: 'Aardvark',
      school: {
        title: 'Medicine',
      },
      publishedAsTbd: true,
    });
    const program2 = EmberObject.create({
      id: 2,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      },
      title: 'Zeppelin',
      school: {
        title: 'Dentistry'
      },
      isPublished: true,
    });
    const permissionCheckerMock = Service.extend({
      canDeleteProgram() {
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    this.set('programs', [ program1, program2 ]);
    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.equal(this.$('thead tr:eq(0) th:eq(0)').text(), 'Program Title');
    assert.equal(this.$('thead tr:eq(0) th:eq(1)').text(), 'School');
    assert.equal(this.$('thead tr:eq(0) th:eq(2)').text(), 'Status');
    assert.equal(this.$('thead tr:eq(0) th:eq(3)').text(), 'Actions');

    assert.equal(this.$('tbody tr:eq(0) td:eq(0)').text().trim(), 'Aardvark');
    assert.equal(this.$('tbody tr:eq(0) td:eq(1)').text().trim(), 'Medicine');
    assert.equal(this.$('tbody tr:eq(0) td:eq(2)').text().trim(), 'Scheduled');
    assert.equal(this.$('tbody tr:eq(0) td:eq(3) a .fa-edit').length, 1);
    assert.equal(this.$('tbody tr:eq(0) td:eq(3) .fa-trash.disabled').length, 1);

    assert.equal(this.$('tbody tr:eq(1) td:eq(0)').text().trim(), 'Zeppelin');
    assert.equal(this.$('tbody tr:eq(1) td:eq(1)').text().trim(), 'Dentistry');
    assert.equal(this.$('tbody tr:eq(1) td:eq(2)').text().trim(), 'Published');
    assert.equal(this.$('tbody tr:eq(1) td:eq(3) a .fa-edit').length, 1);
    assert.equal(this.$('tbody tr:eq(1) td:eq(3) .remove .fa-trash').length, 1);
  });

  test('empty list', async function(assert){
    assert.expect(2);
    this.set('programs', []);
    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.equal(this.$('tbody').length, 1);
    assert.equal(this.$('tbody tr').length, 0);
  });

  test('edit', async function(assert){
    assert.expect(1);
    const program1 = EmberObject.create({
      id: 1,
      school: {
        title: 'Foo'
      },
      title: 'Bar',
      isPublished: true,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      },
    });

    this.set('programs', [ program1 ]);
    this.set('editAction', program => {
      assert.equal(program, program1 );
    });

    await render(hbs`{{program-list programs=programs edit=editAction}}`);
    await settled();
    this.$('tbody tr:eq(0) td:eq(1)').click();
  });

  test('remove and cancel', async function(assert){
    assert.expect(5);
    const program1 = EmberObject.create({
      id: 1,
      school: {
        title: 'Foo'
      },
      title: 'Bar',
      isPublished: true,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      },
    });
    const permissionCheckerMock = Service.extend({
      canDeleteProgram(program) {
        assert.equal(program, program1);
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    this.set('programs', [ program1 ]);
    this.set('removeAction', () => {
      assert.ok(false, 'This function should never be called.');
    });
    await render(hbs`{{program-list programs=programs remove=removeAction}}`);
    await settled();
    assert.equal(this.$('tbody tr').length, 1);
    this.$('tbody tr:eq(0) td:eq(3) .remove').click();
    await settled();
    assert.equal(this.$('tbody tr').length, 2);
    assert.ok(this.$('tbody tr:eq(1) td:eq(0)').text().includes('Are you sure you want to delete this program?'));
    await this.$('tbody tr:eq(1) .done').click();
    await settled();
    assert.equal(this.$('tbody tr').length, 1);
  });

  test('remove and confirm', async function(assert){
    assert.expect(5);
    const program1 = EmberObject.create({
      id: 1,
      school: {
        title: 'Foo'
      },
      title: 'Bar',
      isPublished: true,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      },
    });
    const permissionCheckerMock = Service.extend({
      canDeleteProgram(program) {
        assert.equal(program, program1);
        return resolve(true);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    this.set('programs', [ program1 ]);
    this.set('removeAction', (program) => {
      assert.equal(program, program1);
    });
    await render(hbs`{{program-list programs=programs remove=removeAction}}`);
    await settled();
    assert.equal(this.$('tbody tr').length, 1);
    this.$('tbody tr:eq(0) td:eq(3) .remove').click();
    await settled();
    assert.equal(this.$('tbody tr').length, 2);
    assert.ok(this.$('tbody tr:eq(1) td:eq(0)').text().includes('Are you sure you want to delete this program?'));
    this.$('tbody tr:eq(1) .remove').click();
  });

  test('trash is disabled for unprivileged users', async function(assert){
    assert.expect(3);
    const program1 = EmberObject.create({
      id: 1,
      school: {
        title: 'Foo'
      },
      title: 'Bar',
      isPublished: true,
      hasMany() {
        return {
          ids() {
            return [];
          }
        };
      },
    });
    const permissionCheckerMock = Service.extend({
      canDeleteProgram(program) {
        assert.equal(program, program1);
        return resolve(false);
      }
    });
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    this.set('programs', [ program1 ]);
    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.equal(this.$('tbody tr').length, 1);
    assert.equal(this.$('tbody tr:eq(0) td:eq(3) .fa-trash.disabled').length, 1);
  });
});
