import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll, click, find } from '@ember/test-helpers';
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
    assert.equal(find('thead tr:nth-of-type(1) th').textContent, 'Program Title');
    assert.equal(find(findAll('thead tr:nth-of-type(1) th')[1]).textContent, 'School');
    assert.equal(find(findAll('thead tr:nth-of-type(1) th')[2]).textContent, 'Status');
    assert.equal(find(findAll('thead tr:nth-of-type(1) th')[3]).textContent, 'Actions');

    assert.equal(find('tbody tr:nth-of-type(1) td').textContent.trim(), 'Aardvark');
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[1]).textContent.trim(), 'Medicine');
    assert.equal(find(findAll('tbody tr:nth-of-type(1) td')[2]).textContent.trim(), 'Scheduled');
    assert.equal(findAll('tbody tr:nth-of-type(1) td:nth-of-type(4) a .fa-edit').length, 1);
    assert.equal(findAll('tbody tr:nth-of-type(1) td:nth-of-type(4) .fa-trash.disabled').length, 1);

    assert.equal(find('tbody tr:nth-of-type(2) td').textContent.trim(), 'Zeppelin');
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[1]).textContent.trim(), 'Dentistry');
    assert.equal(find(findAll('tbody tr:nth-of-type(2) td')[2]).textContent.trim(), 'Published');
    assert.equal(findAll('tbody tr:nth-of-type(2) td:nth-of-type(4) a .fa-edit').length, 1);
    assert.equal(findAll('tbody tr:nth-of-type(2) td:nth-of-type(4) .remove .fa-trash').length, 1);
  });

  test('empty list', async function(assert){
    assert.expect(2);
    this.set('programs', []);
    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.equal(findAll('tbody').length, 1);
    assert.equal(findAll('tbody tr').length, 0);
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
    await click(findAll('tbody tr:nth-of-type(1) td')[1]);
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
    assert.equal(findAll('tbody tr').length, 1);
    await click('tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
    await settled();
    assert.equal(findAll('tbody tr').length, 2);
    assert.ok(find('tbody tr:nth-of-type(2) td').textContent.includes('Are you sure you want to delete this program?'));
    await click('tbody tr:nth-of-type(2) .done');
    await settled();
    assert.equal(findAll('tbody tr').length, 1);
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
    assert.equal(findAll('tbody tr').length, 1);
    await click('tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
    await settled();
    assert.equal(findAll('tbody tr').length, 2);
    assert.ok(find('tbody tr:nth-of-type(2) td').textContent.includes('Are you sure you want to delete this program?'));
    await click('tbody tr:nth-of-type(2) .remove');
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
    assert.equal(findAll('tbody tr').length, 1);
    assert.equal(findAll('tbody tr:nth-of-type(1) td:nth-of-type(4) .fa-trash.disabled').length, 1);
  });
});
