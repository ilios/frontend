import { getOwner } from '@ember/application';
import RSVP from 'rsvp';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import moment from 'moment';

const { resolve } = RSVP;
const duration = 4;
const program = EmberObject.create({id: 1, title: 'Program', duration});
const startYear = moment().format('YYYY');
const py1 = EmberObject.create({program, startYear});
const py2 = EmberObject.create({program, startYear});
const mockCohorts = [
  EmberObject.create({id: 2, title: 'second', programYear: py1}),
  EmberObject.create({id: 1, title: 'first', programYear: py2}),
];

const mockSchools = [
  {id: 2, title: 'second', cohorts: resolve(mockCohorts)},
  {id: 1, title: 'first', cohorts: resolve([])},
  {id: 3, title: 'third', cohorts: resolve([])},
];
const mockUser = EmberObject.create({
  schools: resolve(mockSchools),
  school: resolve(EmberObject.create(mockSchools[0]))
});

const currentUserMock = Service.extend({
  model: resolve(mockUser)
});

let storeMock;

moduleForComponent('bulk-new-users', 'Integration | Component | bulk new users', {
  integration: true,
  beforeEach(){
    storeMock = Service.extend({
      findAll(what){
        if (what === 'authentication') {
          return resolve([{user: 199, username: 'existingName'}]);
        }
        throw new Error('findAll record called in untested context');
      },
      query(){
        return resolve([]);
      },
      createRecord(){
        throw new Error('Create record called in untested context');
      }
    });
    this.register('service:current-user', currentUserMock);
    getOwner(this).lookup('service:flash-messages').registerTypes(['success', 'warning']);
    this.register('service:store', storeMock);
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
  assert.expect(8);
  this.set('nothing', parseInt);

  storeMock.reopen({
    query(what, {filters}){
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      assert.equal('cohort', what);
      assert.equal(filters.schools[0], 2);
      return resolve([]);
    }
  });

  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  await wait();

  let content = this.$().text().trim();
  assert.notEqual(content.search(/File with user data/), -1);
  assert.notEqual(content.search(/Primary School/), -1);

  const schools = 'select:eq(0) option';
  let options = this.$(schools);
  assert.equal(options.length, mockSchools.length);
  assert.equal(options.eq(0).text().trim(), 'first');
  assert.equal(options.eq(1).text().trim(), 'second');
  assert.equal(options.eq(2).text().trim(), 'third');
});

test('select student mode display cohort', async function(assert) {
  assert.expect(12);
  this.set('nothing', parseInt);

  storeMock.reopen({
    query(what, {filters}){
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      assert.equal('cohort', what);
      assert.equal(filters.schools[0], 2);

      return resolve(mockCohorts);
    }
  });

  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);
  run( async () => {
    this.$('.click-choice-buttons .second-button').click();
    await wait();
    let content = this.$().text().trim();
    assert.notEqual(content.search(/File with user data/), -1);
    assert.notEqual(content.search(/Primary School/), -1);
    assert.notEqual(content.search(/Primary Cohort/), -1);

    const schools = 'select:eq(0) option';
    let options = this.$(schools);
    assert.equal(options.length, mockSchools.length);
    assert.equal(options.eq(0).text().trim(), 'first');
    assert.equal(options.eq(1).text().trim(), 'second');
    assert.equal(options.eq(2).text().trim(), 'third');

    const cohorts = 'select:eq(1) option';
    options = this.$(cohorts);
    assert.equal(options.length, mockCohorts.length);
    assert.equal(options.eq(0).text().trim(), 'Program first');
    assert.equal(options.eq(1).text().trim(), 'Program second');
  });
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
  assert.expect(35);
  let called = 0;
  let facultyRole = {id: '3'};
  let studentRole = {id: '4'};
  storeMock.reopen({
    findAll(what) {
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      assert.equal(what, 'user-role');
      return [facultyRole, studentRole];
    },
    createRecord(what, obj) {
      let rhett = EmberObject.create(obj);
      switch (called) {
      case 0:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            assert.equal(this.get('firstName'), 'jasper');
            assert.equal(this.get('lastName'), 'johnson');
            assert.equal(this.get('middleName'), null);
            assert.equal(this.get('phone'), '1234567890');
            assert.equal(this.get('email'), 'jasper.johnson@example.com');
            assert.equal(this.get('campusId'), '123Campus');
            assert.equal(this.get('otherId'), '123Other');
            assert.equal(this.get('addedViaIlios'), true);
            assert.equal(this.get('enabled'), true);
            assert.equal(this.get('roles')[0], facultyRole);
          }
        });
        break;
      case 1:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            assert.equal(this.get('username'), 'jasper');
            assert.equal(this.get('password'), '123Test');
            assert.equal(this.get('user').get('firstName'), 'jasper');
          }
        });
        break;
      case 2:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            assert.equal(this.get('firstName'), 'jackson');
            assert.equal(this.get('lastName'), 'johnson');
            assert.equal(this.get('middleName'), 'middle');
            assert.equal(this.get('phone'), '12345');
            assert.equal(this.get('email'), 'jj@example.com');
            assert.equal(this.get('campusId'), '1234Campus');
            assert.equal(this.get('otherId'), '1234Other');
            assert.equal(this.get('addedViaIlios'), true);
            assert.equal(this.get('enabled'), true);
            assert.equal(this.get('roles')[0], facultyRole);

          }
        });

        break;
      case 3:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            assert.equal(this.get('username'), 'jck');
            assert.equal(this.get('password'), '1234Test');
            assert.equal(this.get('user').get('firstName'), 'jackson');
          }
        });
        break;
      default:
        assert.ok(false, 'Extra createRecord called when it shoul not have been');
      }

      called++;
      return rhett;
    }
  });

  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test'],
    ['jackson', 'johnson', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', 'jck', '1234Test'],
    ['invaliduser'],
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  this.$('.done').click();
});

test('saves valid student users', async function(assert) {
  assert.expect(37);
  let called = 0;
  let facultyRole = {id: '3'};
  let studentRole = {id: '4'};
  storeMock.reopen({
    findAll(what){
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      assert.equal(what, 'user-role');
      return [facultyRole, studentRole];
    },
    createRecord(what, obj) {
      let rhett = EmberObject.create(obj);
      switch (called) {
      case 0:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            assert.equal(this.get('firstName'), 'jasper');
            assert.equal(this.get('lastName'), 'johnson');
            assert.equal(this.get('middleName'), null);
            assert.equal(this.get('phone'), '1234567890');
            assert.equal(this.get('email'), 'jasper.johnson@example.com');
            assert.equal(this.get('campusId'), '123Campus');
            assert.equal(this.get('otherId'), '123Other');
            assert.equal(this.get('addedViaIlios'), true);
            assert.equal(this.get('enabled'), true);
            assert.equal(this.get('roles')[0], studentRole);
            assert.equal(this.get('primaryCohort').get('id'), mockCohorts[1].get('id'));
          }
        });
        break;
      case 1:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            assert.equal(this.get('username'), 'jasper');
            assert.equal(this.get('password'), '123Test');
            assert.equal(this.get('user').get('firstName'), 'jasper');
          }
        });
        break;
      case 2:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            assert.equal(this.get('firstName'), 'jackson');
            assert.equal(this.get('lastName'), 'johnson');
            assert.equal(this.get('middleName'), 'middle');
            assert.equal(this.get('phone'), '12345');
            assert.equal(this.get('email'), 'jj@example.com');
            assert.equal(this.get('campusId'), '1234Campus');
            assert.equal(this.get('otherId'), '1234Other');
            assert.equal(this.get('addedViaIlios'), true);
            assert.equal(this.get('enabled'), true);
            assert.equal(this.get('roles')[0], studentRole);
            assert.equal(this.get('primaryCohort').get('id'), mockCohorts[1].get('id'));

          }
        });

        break;
      case 3:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            assert.equal(this.get('username'), 'jck');
            assert.equal(this.get('password'), '1234Test');
            assert.equal(this.get('user').get('firstName'), 'jackson');
          }
        });
        break;
      default:
        assert.ok(false, 'Extra createRecord called when it shoul not have been');
      }

      called++;
      return rhett;
    }
  });

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

test('duplicate username errors on save', async function(assert) {
  let called = 0;
  storeMock.reopen({
    findAll(what) {
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      let facultyRole = {id: '3'};
      let studentRole = {id: '4'};
      assert.equal(what, 'user-role');
      return [facultyRole, studentRole];
    },
    createRecord(what, obj) {
      let rhett = EmberObject.create(obj);
      switch (called) {
      case 0:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){

          }
        });
        break;
      case 1:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){
            this.isError = true;
            throw new Error();
          }
        });
        break;
      default:
        assert.ok(false, 'Extra createRecord called when it shoul not have been');
      }

      called++;
      return rhett;
    }
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', 'jasper', '123Test']
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  await this.$('.done').click();
  await wait();
  assert.ok(this.$('.saving-authentication-errors').length, 1);
  assert.equal(this.$('.saving-authentication-errors li').text().trim(), 'johnson, jasper (jasper.johnson@example.com)');
});

test('error saving user', async function(assert) {
  let called = 0;
  storeMock.reopen({
    findAll(what) {
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      let facultyRole = {id: '3'};
      let studentRole = {id: '4'};
      assert.equal(what, 'user-role');
      return [facultyRole, studentRole];
    },
    createRecord(what, obj) {
      let rhett = EmberObject.create(obj);
      switch (called) {
      case 0:
        assert.equal(what, 'user');
        assert.equal(window.Object.keys(obj).length, 9);
        rhett.reopen({
          save(){
            this.isError = true;
            throw new Error();
          }
        });
        break;
      case 1:
        assert.equal(what, 'authentication');
        assert.equal(window.Object.keys(obj).length, 2);
        rhett.reopen({
          save(){}
        });
        break;
      default:
        assert.ok(false, 'Extra createRecord called when it shoul not have been');
      }

      called++;
      return rhett;
    }
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
  let called = 0;
  storeMock.reopen({
    findAll(what) {
      if (what === 'authentication') {
        return resolve([{user: 199, username: 'existingName'}]);
      }
      assert.equal(what, 'user-role');
      return [{id: '3'}, {id: '4'}];
    },
    createRecord(what, obj) {
      let rhett = EmberObject.create(obj);
      switch (called) {
      case 0:
        rhett.reopen({
          save(){
            assert.ok(true);
          }
        });
        break;
      default:
        assert.ok(false, 'Should not have called create record since there was no username sent');
      }

      called++;
      return rhett;
    }
  });
  this.set('nothing', parseInt);
  this.render(hbs`{{bulk-new-users close=(action nothing)}}`);

  let users = [
    ['jasper', 'johnson', '', '1234567890', 'jasper.johnson@example.com', '123Campus', '123Other', '', '123Test']
  ];
  await triggerUpload(users, this.$('input[type=file]'));
  this.$('.done').click();
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
