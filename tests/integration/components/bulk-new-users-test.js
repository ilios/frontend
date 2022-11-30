import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import {
  render,
  settled,
  click,
  findAll,
  find,
  triggerEvent,
  waitUntil,
  waitFor,
} from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { DateTime } from 'luxon';
import { Response } from 'miragejs';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | bulk new users', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const duration = 4;
    this.server.create('school', { title: 'first' });
    const school = this.server.create('school', { title: 'second' });
    this.server.create('school', { title: 'third' });

    const program = this.server.create('program', { id: 1, title: 'Program', duration, school });
    const startYear = DateTime.now().year;
    const py1 = this.server.create('program-year', { program, startYear });
    const py2 = this.server.create('program-year', { program, startYear });
    this.server.create('cohort', { id: 2, title: 'second', programYear: py1 });
    this.server.create('cohort', { id: 1, title: 'first', programYear: py2 });

    const user = this.server.create('user', { school });
    this.server.create('authentication', { user });
    const userModel = await this.owner.lookup('service:store').findRecord('user', user.id);
    class PermissionCheckerMock extends Service {
      async canCreateUser() {
        return true;
      }
    }
    class CurrentUserMock extends Service {
      async getModel() {
        return userModel;
      }
    }

    this.owner.register('service:current-user', CurrentUserMock);
    this.owner.lookup('service:flash-messages').registerTypes(['success', 'warning']);
    this.owner.register('service:permissionChecker', PermissionCheckerMock);
  });

  const createFile = function (users) {
    let file;
    const lines = users.map((arr) => {
      return arr.join('\t');
    });

    const contents = lines.join('\n');
    if (typeof window.WebKitBlobBuilder === 'undefined') {
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

  const triggerUpload = async function (users, inputElement) {
    const file = createFile(users);
    await triggerEvent(inputElement, 'change', { files: [file] });
    await waitFor('[data-test-proposed-new-users]');
  };

  test('it renders', async function (assert) {
    assert.expect(6);

    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const content = this.element.textContent.trim();
    assert.notEqual(content.search(/File with user data/), -1);
    assert.notEqual(content.search(/Primary School/), -1);

    const schools = 'select:nth-of-type(1) option';
    const options = findAll(schools);
    assert.strictEqual(options.length, 3);
    assert.dom(options[0]).hasText('first');
    assert.dom(options[1]).hasText('second');
    assert.dom(options[2]).hasText('third');
  });

  test('select student mode display cohort', async function (assert) {
    assert.expect(10);

    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);
    await click('.click-choice-buttons .second-button');
    const content = this.element.textContent.trim();
    assert.notEqual(content.search(/File with user data/), -1);
    assert.notEqual(content.search(/Primary School/), -1);
    assert.notEqual(content.search(/Primary Cohort/), -1);

    const schools = '[data-test-schools] option';
    let options = findAll(schools);
    assert.strictEqual(options.length, 3);
    assert.dom(options[0]).hasText('first');
    assert.dom(options[1]).hasText('second');
    assert.dom(options[2]).hasText('third');

    const cohorts = '[data-test-cohorts] option';
    options = findAll(cohorts);
    assert.strictEqual(options.length, 2);
    assert.dom(options[0]).hasText('Program first');
    assert.dom(options[1]).hasText('Program second');
  });

  test('parses file into table', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    assert.dom('table tbody tr').exists({ count: 2 });
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(1) input').isChecked();
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(2)').hasText('jasper');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(3)').hasText('johnson');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(4)').hasText('');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(5)').hasText('1234567890');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(6)').hasText('jasper.johnson@example.com');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(7)').hasText('123Campus');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(8)').hasText('123Other');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(9)').hasText('jasper');
    assert.dom('tbody tr:nth-of-type(1) td:nth-of-type(10)').hasText('123Test');

    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(1) input').isChecked();
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(2)').hasText('jackson');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(3)').hasText('johnson');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(4)').hasText('middle');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(5)').hasText('12345');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(6)').hasText('jj@example.com');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(7)').hasText('1234Campus');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(8)').hasText('1234Other');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(9)').hasText('jck');
    assert.dom('tbody tr:nth-of-type(2) td:nth-of-type(10)').hasText('1234Test');
  });

  test('saves valid faculty users', async function (assert) {
    assert.expect(30);
    this.server.create('user-role', { id: 4 });

    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
      ['invaliduser'],
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');
    assert.strictEqual(this.server.db.users[1].firstName, 'jasper');
    assert.strictEqual(this.server.db.users[1].lastName, 'johnson');
    assert.strictEqual(this.server.db.users[1].middleName, null);
    assert.strictEqual(this.server.db.users[1].phone, '1234567890');
    assert.strictEqual(this.server.db.users[1].email, 'jasper.johnson@example.com');
    assert.strictEqual(this.server.db.users[1].campusId, '123Campus');
    assert.strictEqual(this.server.db.users[1].otherId, '123Other');
    assert.true(this.server.db.users[1].addedViaIlios);
    assert.true(this.server.db.users[1].enabled);
    assert.strictEqual(this.server.db.users[1].roleIds, null);
    assert.strictEqual(this.server.db.users[1].cohortIds, null);
    assert.strictEqual(this.server.db.users[1].authenticationId, '2');

    assert.strictEqual(this.server.db.authentications[1].username, 'jasper');
    assert.strictEqual(this.server.db.authentications[1].password, '123Test');
    assert.strictEqual(this.server.db.authentications[1].userId, '2');

    assert.strictEqual(this.server.db.users[2].firstName, 'jackson');
    assert.strictEqual(this.server.db.users[2].lastName, 'johnson');
    assert.strictEqual(this.server.db.users[2].middleName, 'middle');
    assert.strictEqual(this.server.db.users[2].phone, '12345');
    assert.strictEqual(this.server.db.users[2].email, 'jj@example.com');
    assert.strictEqual(this.server.db.users[2].campusId, '1234Campus');
    assert.strictEqual(this.server.db.users[2].otherId, '1234Other');
    assert.true(this.server.db.users[2].addedViaIlios);
    assert.true(this.server.db.users[2].enabled);
    assert.strictEqual(this.server.db.users[2].roleIds, null);
    assert.strictEqual(this.server.db.users[2].cohortIds, null);
    assert.strictEqual(this.server.db.users[2].authenticationId, '3');

    assert.strictEqual(this.server.db.authentications[2].username, 'jck');
    assert.strictEqual(this.server.db.authentications[2].password, '1234Test');
    assert.strictEqual(parseInt(this.server.db.authentications[2].userId, 10), 3);
  });

  test('saves valid student users', async function (assert) {
    assert.expect(28);
    this.server.create('user-role', { id: 4 });

    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);
    await click('.click-choice-buttons .second-button');

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
      ['invaliduser'],
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');

    assert.strictEqual(this.server.db.users[1].firstName, 'jasper');
    assert.strictEqual(this.server.db.users[1].lastName, 'johnson');
    assert.strictEqual(this.server.db.users[1].middleName, null);
    assert.strictEqual(this.server.db.users[1].phone, '1234567890');
    assert.strictEqual(this.server.db.users[1].email, 'jasper.johnson@example.com');
    assert.strictEqual(this.server.db.users[1].campusId, '123Campus');
    assert.strictEqual(this.server.db.users[1].otherId, '123Other');
    assert.true(this.server.db.users[1].addedViaIlios);
    assert.true(this.server.db.users[1].enabled);
    assert.deepEqual(this.server.db.users[1].roleIds, ['4']);
    assert.strictEqual(this.server.db.users[1].authenticationId, '2');

    assert.strictEqual(this.server.db.authentications[1].username, 'jasper');
    assert.strictEqual(this.server.db.authentications[1].password, '123Test');
    assert.strictEqual(this.server.db.authentications[1].userId, '2');

    assert.strictEqual(this.server.db.users[2].firstName, 'jackson');
    assert.strictEqual(this.server.db.users[2].lastName, 'johnson');
    assert.strictEqual(this.server.db.users[2].middleName, 'middle');
    assert.strictEqual(this.server.db.users[2].phone, '12345');
    assert.strictEqual(this.server.db.users[2].email, 'jj@example.com');
    assert.strictEqual(this.server.db.users[2].campusId, '1234Campus');
    assert.strictEqual(this.server.db.users[2].otherId, '1234Other');
    assert.true(this.server.db.users[2].addedViaIlios);
    assert.true(this.server.db.users[2].enabled);
    assert.deepEqual(this.server.db.users[2].roleIds, ['4']);
    assert.strictEqual(this.server.db.users[2].authenticationId, '3');

    assert.strictEqual(this.server.db.authentications[2].username, 'jck');
    assert.strictEqual(this.server.db.authentications[2].password, '1234Test');
    assert.strictEqual(parseInt(this.server.db.authentications[2].userId, 10), 3);
  });

  test('cancel fires close', async function (assert) {
    assert.expect(1);
    this.set('close', () => {
      assert.ok(true);
    });
    await render(hbs`<BulkNewUsers @close={{this.close}} />
`);
    await click('.cancel');
  });

  test('validate firstName', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        '',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(2)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(2)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate lastName', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        '',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(3)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(3)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate middleName', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middlenamewhchiswaytoolongforilios',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(4)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(4)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate email address', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj.com',
        '1234Campus',
        '1234Other',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(6)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(6)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate campusId', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus123456TOOLONGJACK',
        '1234Other',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(7)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(7)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate otherId', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234OtherWAYTOOLONGFORANID',
        'jck',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(8)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(8)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate username length', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jayden',
        'johnson',
        '',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'long_name'.repeat(20),
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(9)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('validate username uniqueness', async function (assert) {
    const user = this.server.create('user');
    this.server.create('authentication', { user, username: 'existingName' });
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        'existingName',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    const badCheck = 'tbody tr:nth-of-type(2) td:nth-of-type(1) input';
    const BadBox = 'tbody tr:nth-of-type(2) td:nth-of-type(9)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
    assert.dom(badCheck).isDisabled();
    assert.dom(BadBox).hasClass('error');
  });

  test('duplicate username errors on save', async function (assert) {
    this.server.post('api/authentications', function () {
      return new Response(500);
    });
    const user = this.server.create('user');
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));
    this.server.create('authentication', { user, username: 'jasper' });
    await click('.done');
    assert.ok(findAll('.saving-authentication-errors').length, 1);
    assert
      .dom('.saving-authentication-errors li')
      .hasText('johnson, jasper (jasper.johnson@example.com)');
  });

  test('error saving user', async function (assert) {
    this.server.post('api/users', function () {
      return new Response(500);
    });
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        'jasper',
        '123Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');

    assert.ok(findAll('.saving-user-errors').length, 1);
    assert.dom('.saving-user-errors li').hasText('johnson, jasper (jasper.johnson@example.com)');
  });

  test('username not required', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        '',
        '1234Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
  });

  test('password not required if username is blank', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jackson',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        '',
        '',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const goodCheck = 'tbody tr:nth-of-type(1) td:nth-of-type(1) input';
    const goodBox = 'tbody tr:nth-of-type(1) td:nth-of-type(9)';
    assert.dom(goodCheck).isNotDisabled();
    assert.dom(goodBox).hasNoClass('error');
  });

  test('dont create authentication if username is not set', async function (assert) {
    assert.expect(2);
    const proposedNewUsers = '[data-test-proposed-new-users]';
    const waitSaving = '[data-test-wait-saving]';
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      [
        'jasper',
        'johnson',
        '',
        '1234567890',
        'jasper.johnson@example.com',
        '123Campus',
        '123Other',
        '',
        '123Test',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));
    await click('.done');
    await waitUntil(() => {
      return findAll(proposedNewUsers).length === 0 && findAll(waitSaving).length === 0;
    });
    await settled();
    assert.strictEqual(this.server.db.users[1].firstName, 'jasper');
    assert.strictEqual(this.server.db.users[1].authenticationId, null);
  });

  test('ignore header row', async function (assert) {
    await render(hbs`<BulkNewUsers @close={{(noop)}} />
`);

    const users = [
      ['First', 'Last', 'middle', '12345', 'jj@example.com', '1234Campus', '1234Other', '', ''],
      [
        'Test Person',
        'johnson',
        'middle',
        '12345',
        'jj@example.com',
        '1234Campus',
        '1234Other',
        '',
        '',
      ],
    ];
    await triggerUpload(users, find('input[type=file]'));

    const rows = 'tbody tr';
    assert.dom(rows).exists({ count: 1 });
  });
});
