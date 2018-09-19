import {
  click,
  fillIn,
  find,
  findAll,
  currentRouteName,
  visit
} from '@ember/test-helpers';
import {
  module,
  test
} from 'qunit';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { getElementText, getText } from 'ilios/tests/helpers/custom-helpers';

const url = '/programs/1';
module('Acceptance | Program - Overview', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.user = await setupAuthentication({ school: this.school });
  });

  test('check fields', async function(assert) {
    var program = this.server.create('program', {
      schoolId: 1,
    });
    await visit(url);
    assert.equal(currentRouteName(), 'program.index');
    assert.equal(await getElementText('.program-overview .programtitleshort span'), getText(program.shortTitle));
    assert.equal(await getElementText('.program-overview .programduration span'), program.duration);
  });

  test('change title', async function (assert) {
    this.user.update({ administeredSchools: [this.school] });
    this.server.create('program', {
      schoolId: 1,
    });
    const container = '.program-details';
    const header = `${container} .program-header`;
    const title = `${header} .title`;
    const edit = `${title} .editable`;
    const input = `${title} input`;
    const done = `${title} .done`;

    await visit(url);
    assert.equal(await getElementText(title), getText('program 0'));
    await click(edit);
    let field = await find(input);
    assert.equal(getText(field.value), getText('program 0'));
    await fillIn(field, 'test new title');
    await click(done);
    assert.equal(await getElementText(title), getText('test new title'));
  });

  test('change short title', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    let program = this.server.create('program', {
      schoolId: 1,
    });
    const container = '.program-details';
    const overview = `${container} .program-overview`;
    const shortTitle = `${overview} .programtitleshort > span`;
    const edit = `${shortTitle} .editable`;
    const input = `${shortTitle} input`;
    const done = `${shortTitle} .done`;

    await visit(url);
    assert.equal(await getElementText(shortTitle), getText(program.shortTitle));
    await click(edit);
    let field = await find(input);
    assert.equal(getText(field.value), getText(program.shortTitle));
    await fillIn(field, 'test title');
    await click(done);
    assert.equal(await getElementText(shortTitle), getText('test title'));
  });

  test('change duration', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    let program = this.server.create('program', {
      schoolId: 1,
    });
    const container = '.program-details';
    const overview = `${container} .program-overview`;
    const duration = `${overview} .programduration > span`;
    const edit = `${duration} .editable`;
    const select = `${duration} select`;
    const options = `${select} option`;
    const done = `${duration} .done`;

    await visit(url);
    assert.equal(await getElementText(duration), program.duration);
    await click(edit);

    let durations = findAll(options);
    assert.equal(durations.length, 10);
    for(let i = 0; i < 10; i++){
      assert.equal(await getElementText(durations[i]), i+1);
    }
    await fillIn(select, '9');
    await click(done);
    assert.equal(await getElementText(duration), '9');
  });


  test('leave duration at 1', async function(assert) {
    this.user.update({ administeredSchools: [this.school] });
    let program = this.server.create('program', {
      schoolId: 1,
      duration: 1,
    });
    const container = '.program-details';
    const overview = `${container} .program-overview`;
    const duration = `${overview} .programduration > span`;
    const edit = `${duration} .editable`;
    const done = `${duration} .done`;

    await visit(url);
    assert.equal(await getElementText(duration), program.duration);
    await click(edit);
    await click(done);
    assert.equal(await getElementText(duration), '1');
  });
});
