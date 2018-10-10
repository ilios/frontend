import { resolve } from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, findAll, find, triggerEvent, waitUntil } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import Response from 'ember-cli-mirage/response';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';


module('Integration | Component | bulk new users', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const duration = 4;
    this.server.create('school', { title: 'first' });
    const school = this.server.create('school', { title: 'second' });
    this.server.create('school', { title: 'third' });

    const program = this.server.create('program', {id: 1, title: 'Program', duration, school});
    const startYear = moment().format('YYYY');
    const py1 = this.server.create('program-year', {program, startYear});
    const py2 = this.server.create('program-year', {program, startYear});
    this.server.create('cohort', {id: 2, title: 'second', programYear: py1});
    this.server.create('cohort', { id: 1, title: 'first', programYear: py2 });

    const schoolModel = await run(() => this.owner.lookup('service:store').find('school', school.id));

    const mockUser = EmberObject.create({
      school: resolve(schoolModel)
    });

    const currentUserMock = Service.extend({
      model: resolve(mockUser)
    });

    const permissionCheckerMock = Service.extend({
      async canCreateUser() {
        return resolve(true);
      }
    });

    this.owner.register('service:current-user', currentUserMock);
    this.owner.lookup('service:flash-messages').registerTypes(['success', 'warning']);
    this.owner.register('service:permissionChecker', permissionCheckerMock);
  });

  let createFile = function(users){
    let file;
    let lines = users.map(arr => {
      return arr.join("\t");
    });

    let contents = lines.join("\n");
    if (typeof window.WebKitBlobBuilder === "undefined") {
      file = new Blob([contents], { type: 'text/plain' });
    } else {
      const builder = new window.WebKitBlobBuilder();
      builder.append(contents);
      file = builder.getBlob();
    }

    file.mime = 'text/plain';
    file.name = 'test.txt';
    return file;
  };

  let triggerUpload = async function(users, inputElement){
    let file = createFile(users);
    await triggerEvent(
      inputElement,
      'change',
      [file]
    );
    return settled();
  };

  test('it renders', async function(assert) {
    assert.expect(6);
    this.set('nothing', parseInt);

    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let content = this.element.textContent.trim();
    assert.notEqual(content.search(/File with user data/), -1);
    assert.notEqual(content.search(/Primary School/), -1);

    const schools = 'select:nth-of-type(1) option';
    let options = findAll(schools);
    assert.equal(options.length, 3);
    assert.equal(options[0].textContent.trim(), 'first');
    assert.equal(options[1].textContent.trim(), 'second');
    assert.equal(options[2].textContent.trim(), 'third');
  });

  test('select student mode display cohort', async function(assert) {
    assert.expect(10);
    this.set('nothing', parseInt);

    await render(hbs`{{bulk-new-users close=(action nothing)}}`);
    await click('.click-choice-buttons .second-button');
    let content = this.element.textContent.trim();
    assert.notEqual(content.search(/File with user data/), -1);
    assert.notEqual(content.search(/Primary School/), -1);
    assert.notEqual(content.search(/Primary Cohort/), -1);

    const schools = '[data-test-schools] option';
    let options = findAll(schools);
    assert.equal(options.length, 3);
    assert.equal(options[0].textContent.trim(), 'first');
    assert.equal(options[1].textContent.trim(), 'second');
    assert.equal(options[2].textContent.trim(), 'third');

    const cohorts = '[data-test-cohorts] option';
    options = findAll(cohorts);
    assert.equal(options.length, 2);
    assert.equal(options[0].textContent.trim(), 'Program first');
    assert.equal(options[1].textContent.trim(), 'Program second');
  });

  test('parses file into table', async function (assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    assert.equal(findAll('table tbody tr').length, 2);
    assert.ok(find('tbody tr:nth-of-type(2) td:nth-of-type(1) input').checked);
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(2)').textContent.trim(), 'jasper');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(3)').textContent.trim(), 'johnson');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(4)').textContent.trim(), '');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(5)').textContent.trim(), '1234567890');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(6)').textContent.trim(), 'jasper.johnson@example.com');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(7)').textContent.trim(), '123Campus');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(8)').textContent.trim(), '123Other');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(9)').textContent.trim(), 'jasper');
    assert.equal(find('tbody tr:nth-of-type(1) td:nth-of-type(10)').textContent.trim(), '123Test');

    assert.ok(find('tbody tr:nth-of-type(2) td:nth-of-type(1) input').checked);
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(2)').textContent.trim(), 'jackson');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(3)').textContent.trim(), 'johnson');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(4)').textContent.trim(), 'middle');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(5)').textContent.trim(), '12345');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(6)').textContent.trim(), 'jj@example.com');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(7)').textContent.trim(), '1234Campus');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(8)').textContent.trim(), '1234Other');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(9)').textContent.trim(), 'jck');
    assert.equal(find('tbody tr:nth-of-type(2) td:nth-of-type(10)').textContent.trim(), '1234Test');
  });

  test('saves valid faculty users', async function(assert) {
    assert.expect(30);
    this.server.create('user-role', { id: 4 });

    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
      ['invaliduser'],
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');
    assert.equal(this.server.db.users[0].firstName, 'jasper');
    assert.equal(this.server.db.users[0].lastName, 'johnson');
    assert.equal(this.server.db.users[0].middleName, null);
    assert.equal(this.server.db.users[0].phone, '1234567890');
    assert.equal(this.server.db.users[0].email, 'jasper.johnson@example.com');
    assert.equal(this.server.db.users[0].campusId, '123Campus');
    assert.equal(this.server.db.users[0].otherId, '123Other');
    assert.equal(this.server.db.users[0].addedViaIlios, true);
    assert.equal(this.server.db.users[0].enabled, true);
    assert.equal(this.server.db.users[0].roleIds, null);
    assert.equal(this.server.db.users[0].cohortIds, null);
    assert.equal(this.server.db.users[0].authenticationId, '1');

    assert.equal(this.server.db.authentications[0].username, 'jasper');
    assert.equal(this.server.db.authentications[0].password, '123Test');
    assert.equal(this.server.db.authentications[0].userId, '1');


    assert.equal(this.server.db.users[1].firstName, 'jackson');
    assert.equal(this.server.db.users[1].lastName, 'johnson');
    assert.equal(this.server.db.users[1].middleName, 'middle');
    assert.equal(this.server.db.users[1].phone, '12345');
    assert.equal(this.server.db.users[1].email, 'jj@example.com');
    assert.equal(this.server.db.users[1].campusId, '1234Campus');
    assert.equal(this.server.db.users[1].otherId, '1234Other');
    assert.equal(this.server.db.users[1].addedViaIlios, true);
    assert.equal(this.server.db.users[1].enabled, true);
    assert.equal(this.server.db.users[1].roleIds, null);
    assert.equal(this.server.db.users[1].cohortIds, null);
    assert.equal(this.server.db.users[1].authenticationId, '2');

    assert.equal(this.server.db.authentications[1].username, 'jck');
    assert.equal(this.server.db.authentications[1].password, '1234Test');
    assert.equal(this.server.db.authentications[1].userId, 2);
  });

  test('saves valid student users', async function(assert) {
    assert.expect(28);
    this.server.create('user-role', { id: 4 });

    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    run(async () => {
      await click('.click-choice-buttons .second-button');
    });

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
      ['invaliduser'],
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');

    await settled();
    assert.equal(this.server.db.users[0].firstName, 'jasper');
    assert.equal(this.server.db.users[0].lastName, 'johnson');
    assert.equal(this.server.db.users[0].middleName, null);
    assert.equal(this.server.db.users[0].phone, '1234567890');
    assert.equal(this.server.db.users[0].email, 'jasper.johnson@example.com');
    assert.equal(this.server.db.users[0].campusId, '123Campus');
    assert.equal(this.server.db.users[0].otherId, '123Other');
    assert.equal(this.server.db.users[0].addedViaIlios, true);
    assert.equal(this.server.db.users[0].enabled, true);
    assert.deepEqual(this.server.db.users[0].roleIds, ['4']);
    assert.equal(this.server.db.users[0].authenticationId, '1');

    assert.equal(this.server.db.authentications[0].username, 'jasper');
    assert.equal(this.server.db.authentications[0].password, '123Test');
    assert.equal(this.server.db.authentications[0].userId, '1');


    assert.equal(this.server.db.users[1].firstName, 'jackson');
    assert.equal(this.server.db.users[1].lastName, 'johnson');
    assert.equal(this.server.db.users[1].middleName, 'middle');
    assert.equal(this.server.db.users[1].phone, '12345');
    assert.equal(this.server.db.users[1].email, 'jj@example.com');
    assert.equal(this.server.db.users[1].campusId, '1234Campus');
    assert.equal(this.server.db.users[1].otherId, '1234Other');
    assert.equal(this.server.db.users[1].addedViaIlios, true);
    assert.equal(this.server.db.users[1].enabled, true);
    assert.deepEqual(this.server.db.users[1].roleIds, ['4']);
    assert.equal(this.server.db.users[1].authenticationId, '2');

    assert.equal(this.server.db.authentications[1].username, 'jck');
    assert.equal(this.server.db.authentications[1].password, '1234Test');
    assert.equal(this.server.db.authentications[1].userId, 2);

  });


  test('cancel fires close', async function(assert) {
    assert.expect(1);
    this.set('close', ()=> {
      assert.ok(true);
    });
    await render(hbs`{{bulk-new-users close=(action close)}}`);
    await click('.cancel');
  });

  test('validate firstName', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('validate lastName', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', '', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('validate middleName', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middlenamewhchiswaytoolongforilios', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('validate email address', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(6)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(6)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('validate campusId', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus123456TOOLONGJACK', '1234Other', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(7)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(7)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('validate otherId', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234OtherWAYTOOLONGFORANID', 'jck', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(8)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(8)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('validate username', async function(assert) {
    this.set('nothing', parseInt);
    const user = this.server.create('user');
    this.server.create('authentication', { user, username: 'existingName' });
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'existingName', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(9)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
    assert.ok(find(badCheck).disabled);
    assert.ok(find(BadBox).classList.contains('error'));
  });

  test('duplicate username errors on save', async function (assert) {
    this.server.post('api/authentications', function () {
      return new Response(500);
    });
    this.set('nothing', parseInt);
    const user = this.server.create('user');
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test']
    ];
    await triggerUpload(users, find('input[type=file]'));
    this.server.create('authentication', { user, username: 'jasper' });
    await click('.done');
    await settled();
    assert.ok(findAll('.saving-authentication-errors').length, 1);
    assert.equal(find('.saving-authentication-errors li').textContent.trim(), 'johnson, jasper (jasper.johnson@example.com)');
  });

  test('error saving user', async function (assert) {
    this.server.post('api/users', function () {
      return new Response(500);
    });
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test']
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');
    await settled();
    assert.ok(findAll('.saving-user-errors').length, 1);
    assert.equal(find('.saving-user-errors li').textContent.trim(), 'johnson, jasper (jasper.johnson@example.com)');
  });

  test('username not required', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', '1234Test'],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
  });

  test('password not required if username is blank', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    assert.notOk(find(goodCheck).disabled);
    assert.notOk(find(goodBox).classList.contains('error'));
  });

  test('dont create authentication if username is not set', async function(assert) {
    assert.expect(2);
    this.set('nothing', parseInt);
    const proposedNewUsers = '[data-test-proposed-new-users]';
    const waitSaving = '[data-test-wait-saving]';
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', '', '123Test']
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');
    await waitUntil(() => {
      return findAll(proposedNewUsers).length === 0 && findAll(waitSaving).length === 0;
    });
    await settled();
    assert.equal(this.server.db.users[0].firstName, 'jasper');
    assert.equal(this.server.db.users[0].authenticationId, null);

  });

  test('ignore header row', async function(assert) {
    this.set('nothing', parseInt);
    await render(hbs`{{bulk-new-users close=(action nothing)}}`);

    let users = [
      ['First', 'Last', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
      ['Test Person', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const rows = 'tbody tr';
    assert.equal(findAll(rows).length, 1);
  });
});
