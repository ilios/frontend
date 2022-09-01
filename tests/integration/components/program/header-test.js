import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program/header';

module('Integration | Component | program/header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{true}} />`);
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
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{false}} />`);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.notOk(component.title.canEdit);
  });

  test('update title fails - title too short', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{true}} />`);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('ab');
    await component.title.save();
    assert.ok(component.title.hasError);
    assert.strictEqual(
      component.title.errorText,
      'This field is too short (minimum is 3 characters)'
    );
  });

  test('update title fails - blank input', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{true}} />`);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('');
    await component.title.save();
    assert.ok(component.title.hasError);
    assert.strictEqual(component.title.errorText, 'This field can not be blank');
  });

  test('update title fails - title too long', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{true}} />`);
    assert.strictEqual(component.title.text, 'Aardvark');
    assert.ok(component.title.canEdit);
    await component.title.edit();
    assert.notOk(component.title.hasError);
    await component.title.set('0123456789'.repeat(21));
    await component.title.save();
    assert.ok(component.title.hasError);
    assert.strictEqual(
      component.title.errorText,
      'This field is too long (maximum is 200 characters)'
    );
  });

  test('update title, then save', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {});
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{true}} />`);
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
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);

    await render(hbs`<Program::Header @program={{this.program}} @canUpdate={{true}} />`);
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
