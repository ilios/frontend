import { getOwner } from '@ember/application';
import { resolve } from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import moment from 'moment';
import { startMirage } from 'ilios/initializers/ember-cli-mirage';
import Response from 'ember-cli-mirage/response';


moduleForComponent('bulk-new-users', 'Integration | Component | bulk new users', {
  integration: true,
  beforeEach() {
    this.server = startMirage();

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

    const mockSchool = EmberObject.create(this.server.db.schools[1], {
      cohorts: resolve(this.server.db.cohorts.map(c => EmberObject.create(c)))
    });

    const mockUser = EmberObject.create({
      school: resolve(mockSchool)
    });

    const currentUserMock = Service.extend({
      model: resolve(mockUser)
    });

    const permissionCheckerMock = Service.extend({
      async canCreateUser() {
        return resolve(true);
      }
    });

    this.register('service:current-user', currentUserMock);
    getOwner(this).lookup('service:flash-messages').registerTypes(['success', 'warning']);
    this.register('service:permissionChecker', permissionCheckerMock);
  },
  teardown() {
    this.server.shutdown();
  }
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
  await inputElement.triggerHandler({
    type: 'change',
    target: {
      files: {
        0: file,
        length: 1,
        item() { return file; }
      }
    }
  });
  return wait();
};

test('it renders', async function(assert) {
  assert.expect(6);
  this.set('nothing', parseInt);

  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  await wait();

  let content = this.$().text().trim();
  assert.notEqual(content.search(/File with user data/), -1);
  assert.notEqual(content.search(/Primary School/), -1);

  const schools = 'select:eq(0) option';
  let options = this.$(schools);
  assert.equal(options.length, 3);
  assert.equal(options.eq(0).text().trim(), 'first');
  assert.equal(options.eq(1).text().trim(), 'second');
  assert.equal(options.eq(2).text().trim(), 'third');
});

test('select student mode display cohort', async function(assert) {
  assert.expect(10);
  this.set('nothing', parseInt);

  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);
  await wait();

  this.$('.click-choice-buttons .second-button').click();
  await wait();
  let content = this.$().text().trim();
  assert.notEqual(content.search(/File with user data/), -1);
  assert.notEqual(content.search(/Primary School/), -1);
  assert.notEqual(content.search(/Primary Cohort/), -1);

  const schools = 'select:eq(0) option';
  let options = this.$(schools);
  assert.equal(options.length, 3);
  assert.equal(options.eq(0).text().trim(), 'first');
  assert.equal(options.eq(1).text().trim(), 'second');
  assert.equal(options.eq(2).text().trim(), 'third');

  const cohorts = 'select:eq(1) option';
  options = this.$(cohorts);
  assert.equal(options.length, 2);
  assert.equal(options.eq(0).text().trim(), 'Program first');
  assert.equal(options.eq(1).text().trim(), 'Program second');
});

test('parses file into table', async function (assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  let userRows = this.$('table tbody tr');
  assert.equal(userRows.length, 2);
  assert.ok(this.$('tr:eq(1) td:eq(0) input').prop('checked'));
  assert.equal(this.$('tr:eq(1) td:eq(1)').text().trim(), 'jasper');
  assert.equal(this.$('tr:eq(1) td:eq(2)').text().trim(), 'johnson');
  assert.equal(this.$('tr:eq(1) td:eq(3)').text().trim(), '');
  assert.equal(this.$('tr:eq(1) td:eq(4)').text().trim(), '1234567890');
  assert.equal(this.$('tr:eq(1) td:eq(5)').text().trim(), 'jasper.johnson@example.com');
  assert.equal(this.$('tr:eq(1) td:eq(6)').text().trim(), '123Campus');
  assert.equal(this.$('tr:eq(1) td:eq(7)').text().trim(), '123Other');
  assert.equal(this.$('tr:eq(1) td:eq(8)').text().trim(), 'jasper');
  assert.equal(this.$('tr:eq(1) td:eq(9)').text().trim(), '123Test');

  assert.ok(this.$('tr:eq(2) td:eq(0) input').prop('checked'));
  assert.equal(this.$('tr:eq(2) td:eq(1)').text().trim(), 'jackson');
  assert.equal(this.$('tr:eq(2) td:eq(2)').text().trim(), 'johnson');
  assert.equal(this.$('tr:eq(2) td:eq(3)').text().trim(), 'middle');
  assert.equal(this.$('tr:eq(2) td:eq(4)').text().trim(), '12345');
  assert.equal(this.$('tr:eq(2) td:eq(5)').text().trim(), 'jj@example.com');
  assert.equal(this.$('tr:eq(2) td:eq(6)').text().trim(), '1234Campus');
  assert.equal(this.$('tr:eq(2) td:eq(7)').text().trim(), '1234Other');
  assert.equal(this.$('tr:eq(2) td:eq(8)').text().trim(), 'jck');
  assert.equal(this.$('tr:eq(2) td:eq(9)').text().trim(), '1234Test');
});

test('saves valid faculty users', async function(assert) {
  assert.expect(30);
  this.server.create('user-role', { id: 4 });

  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ['invaliduser'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  this.$('.done').click();
  await wait();
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
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  run(()=> {
    this.$('.click-choice-buttons .second-button').click();
  });

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ['invaliduser'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  this.$('.done').click();

  await wait();
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
  this.render(hbs`{{bulk-new-users close=(action close)}}`);
  this.$('.cancel').click();
});

test('validate firstName', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(1)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(1)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('validate lastName', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', '', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(2)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(2)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('validate middleName', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middlenamewhchiswaytoolongforilios', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(3)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(3)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('validate email address', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj.com', '1234Campus', '1234Other', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(5)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(5)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('validate campusId', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus123456TOOLONGJACK', '1234Other', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(6)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(6)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('validate otherId', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234OtherWAYTOOLONGFORANID', 'jck', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(7)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(7)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('validate username', async function(assert) {
  this.set('nothing', parseInt);
  const user = this.server.create('user');
  this.server.create('authentication', { user, username: 'existingName' });
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'existingName', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(8)';
  const badCheck = 'tbody tr:eq(1) td:eq(0) input';
  const BadBox = 'tbody tr:eq(1) td:eq(8)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
  assert.ok(this.$(badCheck).prop('disabled'));
  assert.ok(this.$(BadBox).hasClass('error'));
});

test('duplicate username errors on save', async function (assert) {
  this.server.post('api/authentications', function () {
    return new Response(500);
  });
  this.set('nothing', parseInt);
  const user = this.server.create('user');
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test']
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  this.server.create('authentication', { user, username: 'jasper' });
  await this.$('.done').click();
  await wait();
  assert.ok(this.$('.saving-authentication-errors').length, 1);
  assert.equal(this.$('.saving-authentication-errors li').text().trim(), 'johnson, jasper (jasper.johnson@example.com)');
});

test('error saving user', async function (assert) {
  this.server.post('api/users', function () {
    return new Response(500);
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test']
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  await this.$('.done').click();
  await wait();
  assert.ok(this.$('.saving-user-errors').length, 1);
  assert.equal(this.$('.saving-user-errors li').text().trim(), 'johnson, jasper (jasper.johnson@example.com)');
});

test('username not required', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', '1234Test'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(8)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
});

test('password not required if username is blank', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const goodCheck = 'tbody tr:eq(0) td:eq(0) input';
  const goodBox = 'tbody tr:eq(0) td:eq(8)';
  assert.notOk(this.$(goodCheck).prop('disabled'));
  assert.notOk(this.$(goodBox).hasClass('error'));
});

test('dont create authentication if username is not set', async function(assert) {
  assert.expect(2);
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', '', '123Test']
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  this.$('.done').click();
  await wait();
  assert.equal(this.server.db.users[0].firstName, 'jasper');
  assert.equal(this.server.db.users[0].authenticationId, null);

});

test('ignore header row', async function(assert) {
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['First', 'Last', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
    ['Test Person', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
  ];
  await triggerUpload(users, this.$('input[type=file]'));

  const rows = 'tbody tr';
  assert.equal(this.$(rows).length, 1);
});
