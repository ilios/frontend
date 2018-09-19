import Service from '@ember/service';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  findAll,
  click,
  find
} from '@ember/test-helpers';
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
    assert.dom('thead tr:nth-of-type(1) th').hasText('Program Title');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[1]).hasText('School');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[2]).hasText('Status');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[3]).hasText('Actions');

    assert.dom('tbody tr:nth-of-type(1) td').hasText('Aardvark');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText('Medicine');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[2]).hasText('Scheduled');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) a .fa-edit').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) .fa-trash.disabled').exists({ count: 1 });

    assert.dom('tbody tr:nth-of-type(2) td').hasText('Zeppelin');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText('Dentistry');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[2]).hasText('Published');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(4) a .fa-edit').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(4) .remove .fa-trash').exists({ count: 1 });
  });

  test('empty list', async function(assert){
    assert.expect(2);
    this.set('programs', []);
    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.dom('tbody').exists({ count: 1 });
    assert.dom('tbody tr').doesNotExist();
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
    assert.dom('tbody tr').exists({ count: 1 });
    await click('tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
    await settled();
    assert.dom('tbody tr').exists({ count: 2 });
    assert.ok(find('tbody tr:nth-of-type(2) td').textContent.includes('Are you sure you want to delete this program?'));
    await click('tbody tr:nth-of-type(2) .done');
    await settled();
    assert.dom('tbody tr').exists({ count: 1 });
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
    assert.dom('tbody tr').exists({ count: 1 });
    await click('tbody tr:nth-of-type(1) td:nth-of-type(4) .remove');
    await settled();
    assert.dom('tbody tr').exists({ count: 2 });
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
    assert.dom('tbody tr').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) .fa-trash.disabled').exists({ count: 1 });
  });
});
