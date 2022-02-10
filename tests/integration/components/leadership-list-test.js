import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render, find, findAll, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | leadership list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user1 = this.server.create('user', {
      firstName: 'a',
      middleName: 'b',
      lastName: 'person',
    });
    const user2 = this.server.create('user', {
      firstName: 'b',
      middleName: 'a',
      lastName: 'person',
    });

    const user3 = this.server.create('user', {
      firstName: 'stuart',
      middleName: 'leslie',
      lastName: 'goddard',
      displayName: 'adam ant',
    });

    this.user1 = await this.owner.lookup('service:store').find('user', user1.id);
    this.user2 = await this.owner.lookup('service:store').find('user', user2.id);
    this.user3 = await this.owner.lookup('service:store').find('user', user3.id);
  });

  test('it renders with data', async function (assert) {
    this.set('directors', [this.user1, this.user3]);
    this.set('administrators', [this.user1, this.user2, this.user3]);
    this.set('studentAdvisors', [this.user2, this.user3]);

    await render(hbs`<LeadershipList
      @directors={{this.directors}}
      @administrators={{this.administrators}}
      @studentAdvisors={{this.studentAdvisors}}
      @showAdministrators={{true}}
      @showDirectors={{true}}
      @showStudentAdvisors={{true}}
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-fullname]';
    const directorsUsernameInfo =
      'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-info]';
    const administrators =
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-fullname]';
    const administratorsUsernameInfo =
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-info]';
    const studentAdvisors =
      'table tbody tr:nth-of-type(1) td:nth-of-type(3) li [data-test-fullname]';
    const studentAdvisorsUsernameInfo =
      'table tbody tr:nth-of-type(1) td:nth-of-type(3) li [data-test-info]';

    assert.dom(directors).exists({ count: 2 });
    assert.dom(directorsUsernameInfo).exists({ count: 1 });
    assert.dom(find('.ilios-tooltip')).doesNotExist();
    await triggerEvent(findAll(directorsUsernameInfo)[0], 'mouseover');
    assert.dom(find('.ilios-tooltip')).hasText('Campus name of record: stuart leslie goddard');
    await triggerEvent(findAll(directorsUsernameInfo)[0], 'mouseout');
    assert.dom(find('.ilios-tooltip')).doesNotExist();
    assert.dom(findAll(directors)[0]).hasText('a b. person');
    assert.dom(findAll(directors)[1]).hasText('adam ant');
    assert.dom(administrators).exists({ count: 3 });
    assert.dom(administratorsUsernameInfo).exists({ count: 1 });
    assert.dom(find('.ilios-tooltip')).doesNotExist();
    await triggerEvent(findAll(administratorsUsernameInfo)[0], 'mouseover');
    assert.dom(find('.ilios-tooltip')).hasText('Campus name of record: stuart leslie goddard');
    await triggerEvent(findAll(administratorsUsernameInfo)[0], 'mouseout');
    assert.dom(find('.ilios-tooltip')).doesNotExist();
    assert.dom(findAll(administrators)[0]).hasText('a b. person');
    assert.dom(findAll(administrators)[1]).hasText('adam ant');
    assert.dom(findAll(administrators)[2]).hasText('b a. person');
    assert.dom(studentAdvisors).exists({ count: 2 });
    assert.dom(studentAdvisorsUsernameInfo).exists({ count: 1 });
    assert.dom(find('.ilios-tooltip')).doesNotExist();
    await triggerEvent(findAll(studentAdvisorsUsernameInfo)[0], 'mouseover');
    assert.dom(find('.ilios-tooltip')).hasText('Campus name of record: stuart leslie goddard');
    await triggerEvent(findAll(studentAdvisorsUsernameInfo)[0], 'mouseout');
    assert.dom(find('.ilios-tooltip')).doesNotExist();
    assert.dom(findAll(studentAdvisors)[0]).hasText('adam ant');
    assert.dom(findAll(studentAdvisors)[1]).hasText('b a. person');
  });

  test('it renders without directors', async function (assert) {
    assert.expect(4);

    this.set('administrators', [this.user1]);
    this.set('studentAdvisors', [this.user1]);

    await render(hbs`<LeadershipList
      @showDirectors={{false}}
      @showAdministrators={{true}}
      @administrators={{this.administrators}}
      @showStudentAdvisors={{true}}
      @studentAdvisors={{this.studentAdvisors}}
    />`);
    const administrators =
      'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-fullname]';
    const studentAdvisors =
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-fullname]';

    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('a b. person');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('a b. person');
  });

  test('it renders without administrators', async function (assert) {
    assert.expect(4);

    this.set('directors', [this.user1]);
    this.set('studentAdvisors', [this.user1]);

    await render(hbs`<LeadershipList
      @showAdministrators={{false}}
      @showDirectors={{true}}
      @directors={{this.directors}}
      @showStudentAdvisors={{true}}
      @studentAdvisors={{this.studentAdvisors}}
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-fullname]';
    const studentAdvisors =
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-fullname]';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b. person');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('a b. person');
  });

  test('it renders without student advisors', async function (assert) {
    assert.expect(4);

    this.set('directors', [this.user1]);
    this.set('administrators', [this.user1]);

    await render(hbs`<LeadershipList
      @showDirectors={{true}}
      @directors={{this.directors}}
      @showAdministrators={{true}}
      @administrators={{this.administrators}}
      @showStudentAdvisors={{false}}
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-fullname]';
    const administrators =
      'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-fullname]';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b. person');
    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('a b. person');
  });

  test('it renders without data', async function (assert) {
    assert.expect(6);

    this.set('directors', []);
    this.set('administrators', []);
    this.set('studentAdvisors', []);

    await render(hbs`<LeadershipList
      @directors={{this.directors}}
      @administrators={{this.administrators}}
      @studentAdvisors={{this.studentAdvisors}}
      @showAdministrators={{true}}
      @showDirectors={{true}}
      @showStudentAdvisors={{true}}
      />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('None');
    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('None');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('None');
  });

  test('disabled users are indicated with an icon', async function (assert) {
    assert.expect(10);

    this.user2.set('enabled', false);

    this.set('directors', [this.user1]);
    this.set('administrators', [this.user2, this.user1]);
    this.set('studentAdvisors', [this.user2]);

    await render(hbs`<LeadershipList
      @directors={{this.directors}}
      @administrators={{this.administrators}}
      @studentAdvisors={{this.studentAdvisors}}
      @showAdministrators={{true}}
      @showDirectors={{true}}
      @showStudentAdvisors={{true}}
    />`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li';
    const directorNames = `${directors} [data-test-fullname]`;
    const disabledDirectors = `${directors} .fa-user-xmark`;
    const administratorNames = `${administrators} [data-test-fullname]`;
    const disabledAdministrators = `${administrators} .fa-user-xmark`;
    const studentAdvisorNames = `${studentAdvisors} [data-test-fullname]`;
    const disabledStudentAdvisors = `${studentAdvisors} .fa-user-xmark`;

    assert.dom(directors).exists({ count: 1 });
    assert.dom(disabledDirectors).doesNotExist();
    assert.dom(findAll(directorNames)[0]).hasText('a b. person');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(disabledAdministrators).exists({ count: 1 });
    assert.dom(findAll(administratorNames)[0]).hasText('a b. person');
    assert.dom(findAll(administratorNames)[1]).hasText('b a. person');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(disabledStudentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisorNames)[0]).hasText('b a. person');
  });
});
