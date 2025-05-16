import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'frontend/tests/pages/components/program/header';
import Header from 'frontend/components/program/header';

module('Integration | Component | program/header', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{true}} /></template>);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
  });

  test('read-only', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{false}} /></template>);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.notOk(component.title.canEdit);
  });

  test('validation fails if title is too short', async function (assert) {
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{true}} /></template>);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('ab');
    await component.title.save();
    assert.ok(component.title.hasError);
    assert.strictEqual(component.title.error, 'Title is too short (minimum is 3 characters)');
  });

  test('validation fails if title is blank', async function (assert) {
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{true}} /></template>);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
    assert.strictEqual(component.title.error, 'Title is too short (minimum is 3 characters)');
  });

  test('update title fails - title too long', async function (assert) {
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{true}} /></template>);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.title.save();
    assert.ok(component.title.hasError);
    assert.strictEqual(component.title.error, 'Title is too long (maximum is 200 characters)');
  });

  test('update title, then save', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{true}} /></template>);
    assert.strictEqual(programModel.get('title'), 'Aardvark');
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    await component.title.set('Zeppelin');
    await component.title.save();
    assert.strictEqual(component.title.text, 'Zeppelin');

    assert.strictEqual(programModel.get('title'), 'Zeppelin');
  });

  test('update title, then cancel', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').findRecord('program', program.id);

    this.set('program', programModel);

    await render(<template><Header @program={{this.program}} @canUpdate={{true}} /></template>);
    assert.strictEqual(programModel.get('title'), 'Aardvark');
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    await component.title.set('Zeppelin');
    await component.title.cancel();
    assert.strictEqual(component.title.text, 'Aardvark');

    assert.strictEqual(programModel.get('title'), 'Aardvark');
  });
});
