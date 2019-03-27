import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | program header', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: false,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    assert.dom('.title h4').hasText('Aardvark');
    assert.dom('.title h4 .clickable').exists();
    assert.dom('.program-publication button').exists();
  });

  test('read-only', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: false,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', false);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    assert.dom('.title h4').hasText('Aardvark');
    assert.dom('.title h4 .clickable').doesNotExist();
    assert.dom('.program-publication button').doesNotExist();
  });

  test('no activation button on fully published program', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', false);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    assert.dom('.program-publication button').doesNotExist();
  });

  test('update title fails - title too short', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    await click('.title h4 .clickable');
    assert.dom('.validation-error-message').doesNotExist();
    fillIn('.title h4 input', 'ab');
    await click('.title h4 .done');
    assert.dom('.validation-error-message').hasText('This field is too short (minimum is 3 characters)');
  });

  test('update title fails - blank input', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    await click('.title h4 .clickable');
    assert.dom('.validation-error-message').doesNotExist();
    fillIn('.title h4 input', '');
    await click('.title h4 .done');
    assert.dom('.validation-error-message').hasText('This field can not be blank');
  });

  test('update title fails - title too long', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    await click('.title h4 .clickable');
    assert.dom('.validation-error-message').doesNotExist();
    fillIn('.title h4 input', '0123456789'.repeat(21));
    await click('.title h4 .done');
    assert.dom('.validation-error-message').hasText('This field is too long (maximum is 200 characters)');
  });

  test('update title, then save', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    assert.equal(programModel.get('title'), 'Aardvark');
    await click('.title h4 .clickable');
    fillIn('.title h4 input', 'Zeppelin');
    await click('.title h4 .done');
    assert.dom('.title h4 ').hasText('Zeppelin');
    assert.equal(programModel.get('title'), 'Zeppelin');
  });

  test('update title, then cancel', async function(assert) {
    assert.expect(3);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: true,
      publishedAsTbd: false
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    assert.equal(programModel.get('title'), 'Aardvark');
    await click('.title h4 .clickable');
    fillIn('.title h4 input', 'Zeppelin');
    await click('.title h4 .cancel');
    assert.dom('.title h4 ').hasText('Aardvark');
    assert.equal(programModel.get('title'), 'Aardvark');
  });

  test('activate', async function(assert) {
    assert.expect(5);
    const school = this.server.create('school', {} );
    const program = this.server.create('program', {
      school,
      title: 'Aardvark',
      published: false,
      publishedAsTbd: true
    });
    const programModel = await this.owner.lookup('service:store').find('program', program.id);

    this.set('program', programModel);
    this.set('canUpdate', true);

    const activationBtn = '.program-publication button';
    await render(hbs`{{program-header program=program canUpdate=canUpdate}}`);
    assert.equal(programModel.get('published'), false);
    assert.equal(programModel.get('publishedAsTbd'), true);
    await click(activationBtn);
    assert.dom(activationBtn).doesNotExist();
    assert.equal(programModel.get('published'), true);
    assert.equal(programModel.get('publishedAsTbd'), false);
  });
});
