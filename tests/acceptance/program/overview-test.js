import destroyApp from '../../helpers/destroy-app';
import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/programs/1';
module('Acceptance: Program - Overview', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
    server.create('school');
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('check fields', async function(assert) {
  var program = server.create('program', {
    school: 1,
  });
  await visit(url);
  assert.equal(currentPath(), 'program.index');
  var container = find('.program-overview');
  assert.equal(getElementText(find('.programtitleshort .editable', container)), getText(program.shortTitle));
  assert.equal(getElementText(find('.programduration .editable', container)), program.duration);
});

test('change title', async function(assert) {
  server.create('program', {
    school: 1,
  });
  const container = '.program-details';
  const header = `${container} .program-header`;
  const title = `${header} .title`;
  const edit = `${title} .editable`;
  const input = `${title} input`;
  const done = `${title} .done`;

  await visit(url);
  assert.equal(getElementText(title), getText('program 0'));
  await click(edit);
  let field = await find(input);
  assert.equal(getText(field.val()), getText('program 0'));
  fillIn(field, 'test new title');
  await click(done);
  assert.equal(getElementText(title), getText('test new title'));
});

test('change short title', async function(assert) {
  let program = server.create('program', {
    school: 1,
  });
  const container = '.program-details';
  const overview = `${container} .program-overview`;
  const shortTitle = `${overview} .programtitleshort span:eq(0)`;
  const edit = `${shortTitle} .editable`;
  const input = `${shortTitle} input`;
  const done = `${shortTitle} .done`;

  await visit(url);
  assert.equal(getElementText(shortTitle), getText(program.shortTitle));
  await click(edit);
  let field = await find(input);
  assert.equal(getText(field.val()), getText(program.shortTitle));
  fillIn(field, 'test title');
  await click(done);
  assert.equal(getElementText(shortTitle), getText('test title'));
});

test('change duration', async function(assert) {
  let program = server.create('program', {
    school: 1,
  });
  const container = '.program-details';
  const overview = `${container} .program-overview`;
  const duration = `${overview} .programduration span:eq(0)`;
  const edit = `${duration} .editable`;
  const select = `${duration} select`;
  const options = `${select} option`;
  const done = `${duration} .done`;

  await visit(url);
  assert.equal(getElementText(duration), program.duration);
  await click(edit);

  let durations = find(options);
  assert.equal(durations.length, 10);
  for(let i = 0; i < 10; i++){
    assert.equal(getElementText(durations.eq(i)), i+1);
  }
  await pickOption(select, '9', assert);
  await click(done);
  assert.equal(getElementText(duration), '9');
});


test('leave duration at 1', async function(assert) {
  let program = server.create('program', {
    school: 1,
    duration: 1,
  });
  const container = '.program-details';
  const overview = `${container} .program-overview`;
  const duration = `${overview} .programduration span:eq(0)`;
  const edit = `${duration} .editable`;
  const done = `${duration} .done`;

  await visit(url);
  assert.equal(getElementText(duration), program.duration);
  await click(edit);
  await click(done);
  assert.equal(getElementText(duration), '1');
});
