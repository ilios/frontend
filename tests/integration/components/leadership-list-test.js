import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | leadership list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
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

    this.user1 = await this.owner.lookup('service:store').find('user', user1.id);
    this.user2 = await this.owner.lookup('service:store').find('user', user2.id);
  });

  test('it renders with data', async function(assert) {
    assert.expect(7);

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
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-name]';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-name]';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(3) li [data-test-name]';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b. person');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(findAll(administrators)[0]).hasText('a b. person');
    assert.dom(findAll(administrators)[1]).hasText('b a. person');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('b a. person');
  });

  test('it renders without directors', async function(assert) {
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
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-name]';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-name]';

    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('a b. person');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('a b. person');
  });

  test('it renders without administrators', async function(assert) {
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
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-name]';
    const studentAdvisors = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-name]';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b. person');
    assert.dom(studentAdvisors).exists({ count: 1 });
    assert.dom(findAll(studentAdvisors)[0]).hasText('a b. person');
  });

  test('it renders without student advisors', async function(assert) {
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
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li [data-test-name]';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li [data-test-name]';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b. person');
    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('a b. person');
  });

  test('it renders without data', async function(assert) {
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

  test('disabled users are indicated with an icon', async function(assert) {
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
    const directorNames = `${directors} [data-test-name]`;
    const disabledDirectors = `${directors} .fa-user-times`;
    const administratorNames = `${administrators} [data-test-name]`;
    const disabledAdministrators = `${administrators} .fa-user-times`;
    const studentAdvisorNames = `${studentAdvisors} [data-test-name]`;
    const disabledStudentAdvisors = `${studentAdvisors} .fa-user-times`;

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
