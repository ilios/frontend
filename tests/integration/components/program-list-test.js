import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render, settled, findAll, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | program list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(11);
    const som = this.server.create('school', {
      title: 'Medicine',
    });
    const sod = this.server.create('school', {
      title: 'Dentistry',
    });
    const program1 = this.server.create('program', {
      school: som,
      title: 'Aardvark',
    });

    this.server.create('programYear', {
      program: program1,
    });
    const program2 = this.server.create('program', {
      school: sod,
      title: 'Zeppelin',
    });

    const permissionCheckerMock = Service.extend({
      async canDeleteProgram() {
        return true;
      },
      async canUpdateProgram() {
        return true;
      },
    });

    const programModel1 = await this.owner.lookup('service:store').find('program', program1.id);
    const programModel2 = await this.owner.lookup('service:store').find('program', program2.id);

    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.set('programs', [programModel1, programModel2]);

    await render(hbs`<ProgramList @programs={{programs}} />`);

    assert.dom('thead tr:nth-of-type(1) th').hasText('Program Title');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[1]).hasText('School');
    assert.dom(findAll('thead tr:nth-of-type(1) th')[2]).hasText('Actions');

    assert.dom('tbody tr:nth-of-type(1) td').hasText('Aardvark');
    assert.dom(findAll('tbody tr:nth-of-type(1) td')[1]).hasText('Medicine');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(3) a .fa-edit').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(3) .fa-trash.disabled').exists({ count: 1 });

    assert.dom('tbody tr:nth-of-type(2) td').hasText('Zeppelin');
    assert.dom(findAll('tbody tr:nth-of-type(2) td')[1]).hasText('Dentistry');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(3) a .fa-edit').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(3) .remove .fa-trash').exists({ count: 1 });
  });

  test('empty list', async function (assert) {
    assert.expect(3);

    this.set('programs', []);
    await render(hbs`<ProgramList @programs={{programs}} />`);

    assert.dom('tbody').exists({ count: 1 });
    assert.dom('tbody [data-test-active-row]').doesNotExist();
    assert.dom('tbody [data-test-empty-list]').exists();
  });

  test('edit', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', {
      title: 'Medicine',
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('programs', [programModel]);
    this.set('editAction', (program) => {
      assert.equal(program, programModel);
    });

    await render(hbs`<ProgramList @programs={{programs}} @edit={{editAction}} />`);

    await click(findAll('tbody tr:nth-of-type(1) td')[1]);
  });

  test('remove and cancel', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {
      title: 'Medicine',
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
      },
    });

    this.owner.register('service:permissionChecker', permissionCheckerMock);
    this.set('programs', [programModel]);
    this.set('removeAction', () => {
      assert.ok(false, 'This function should never be called.');
    });

    await render(hbs`<ProgramList @programs={{programs}} @remove={{removeAction}} />`);

    assert.dom('tbody tr').exists({ count: 1 });
    await click('tbody tr:nth-of-type(1) td:nth-of-type(3) .remove');

    assert.dom('tbody tr').exists({ count: 2 });
    assert.ok(
      find('tbody tr:nth-of-type(2) td').textContent.includes(
        'Are you sure you want to delete this program?'
      )
    );
    await click('tbody tr:nth-of-type(2) .done');

    assert.dom('tbody tr').exists({ count: 1 });
  });

  test('remove and confirm', async function (assert) {
    assert.expect(4);
    const school = this.server.create('school', {
      title: 'Medicine',
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
    this.set('programs', [programModel]);

    await render(hbs`<ProgramList @programs={{programs}} @remove={{removeAction}} />`);

    assert.dom('tbody tr').exists({ count: 1 });
    await click('tbody tr:nth-of-type(1) td:nth-of-type(3) .remove');

    assert.dom('tbody tr').exists({ count: 2 });
    assert.ok(
      find('tbody tr:nth-of-type(2) td').textContent.includes(
        'Are you sure you want to delete this program?'
      )
    );
    await click('tbody tr:nth-of-type(2) .remove');
  });

  test('trash is disabled for unprivileged users', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'Medicine',
    });
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);
    const permissionCheckerMock = Service.extend({
      async canDeleteProgram() {
        return false;
      },
    });

    this.set('programs', [programModel]);
    this.owner.register('service:permissionChecker', permissionCheckerMock);

    await render(hbs`<ProgramList @programs={{programs}} />`);

    assert.dom('tbody tr').exists({ count: 1 });
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(3) .fa-trash.disabled').exists({ count: 1 });
  });
});
