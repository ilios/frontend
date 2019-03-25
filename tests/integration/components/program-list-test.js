import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render, settled, findAll, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | program list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert){
    assert.expect(16);
    const som = this.server.create('school', {
      title: 'Medicine'
    });
    const sod = this.server.create('school', {
      title: 'Dentistry'
    });
    const program1 = this.server.create('program', {
      school: som,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: true
    });

    this.server.create('programYear', {
      program: program1,
    });
    const program2 = this.server.create('program', {
      school: sod,
      title: 'Zeppelin',
      published: true,
      publishedAsTbd: false,
    });

    const permissionCheckerMock = Service.extend({
      async canDeleteProgram() {
        return true;
      },
      async canUpdateProgram() {
        return true;
      }
    });

    const programModel1 = await this.owner.lookup('service:store').find('program', program1.id);
    const programModel2 = await this.owner.lookup('service:store').find('program', program2.id);

    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.set('programs', [ programModel1, programModel2 ]);

    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.dom('thead tr:nth-of-type(1) th').hasText('Program Title');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[1]).hasText('School');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[2]).hasText('Status');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[3]).hasText('Actions');

    assert.dom('tbody tr:nth-of-type(1) td').hasText('Aardvark');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText('Medicine');
    assert.dom('tbody tr:nth-of-type(1) td .warning').exists();
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) button').exists();
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) a .fa-edit').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) .fa-trash.disabled').exists({ count: 1 });

    assert.dom('tbody tr:nth-of-type(2) td').hasText('Zeppelin');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText('Dentistry');
    assert.dom('tbody tr:nth-of-type(2) td .yes').exists();
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(4) button').doesNotExist();
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
    const school = this.server.create('school', {
      title: 'Medicine'
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('programs', [ programModel ]);
    this.set('editAction', (program) => {
      assert.equal(program, programModel );
    });

    await render(hbs`{{program-list programs=programs edit=editAction}}`);
    await settled();
    await click(findAll('tbody tr:nth-of-type(1) td')[1]);
  });

  test('remove and cancel', async function(assert){
    assert.expect(5);
    const school = this.server.create('school', {
      title: 'Medicine'
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const permissionCheckerMock = Service.extend({
      async canDeleteProgram(program) {
        assert.equal(program, programModel);
        return true;
      }
    });

    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.set('programs', [ programModel ]);
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
    assert.expect(4);
    const school = this.server.create('school', {
      title: 'Medicine'
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const permissionCheckerMock = Service.extend({
      async canDeleteProgram() {
        return true;
      },
    });

    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.set('removeAction', (program) => {
      assert.equal(program, programModel);
    });
    this.set('programs', [ programModel ]);

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
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'Medicine'
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const permissionCheckerMock = Service.extend({
      async canDeleteProgram() {
        return false;
      }
    });

    this.set('programs', [ programModel ]);
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    await render(hbs`{{program-list programs=programs}}`);
    await settled();
    assert.dom('tbody tr').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4) .fa-trash.disabled').exists({ count: 1 });
  });

  test('activate!', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school', {
      title: 'Medicine'
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: false,
      publishedAsTbd: true,
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const permissionCheckerMock = Service.extend({
      async canUpdateProgram() {
        return true;
      }
    });

    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.set('programs', [ programModel ]);
    this.set('activate', (program) => {
      assert.equal(program, programModel);
    });

    await render(hbs`{{program-list programs=programs activate=activate}}`);
    await settled();
    await click('tbody tr:nth-of-type(1) td:nth-of-type(4) button');
    await settled();
  });
});
