import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import LeadershipList from 'ilios-common/components/leadership-list';
import { component } from 'ilios-common/page-objects/components/leadership-list';

module('Integration | Component | leadership-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user1 = this.server.create('user', {
      firstName: 'a',
      middleName: 'b',
      lastName: 'person',
      enabled: false,
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

    this.user1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    this.user2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    this.user3 = await this.owner.lookup('service:store').findRecord('user', user3.id);
  });

  test('it renders with data', async function (assert) {
    this.set('directors', [this.user1, this.user3]);
    this.set('administrators', [this.user1, this.user2, this.user3]);
    this.set('studentAdvisors', [this.user2, this.user3]);

    await render(
      <template>
        <LeadershipList
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.directors.length, 2);
    assert.ok(component.directors[0].userStatus.accountIsDisabled);
    assert.notOk(component.directors[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.directors[0].userNameInfo.fullName, 'a b. person');
    assert.notOk(component.directors[0].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.directors[1].userStatus.accountIsDisabled);
    assert.strictEqual(component.directors[1].userNameInfo.fullName, 'adam ant');
    assert.ok(component.directors[1].userNameInfo.hasAdditionalInfo);
    await component.directors[1].userNameInfo.expandTooltip();
    assert.strictEqual(
      component.directors[1].userNameInfo.tooltipContents,
      'Campus name of record: stuart leslie goddard',
    );
    await component.directors[1].userNameInfo.closeTooltip();

    assert.strictEqual(component.administrators.length, 3);
    assert.ok(component.administrators[0].userStatus.accountIsDisabled);
    assert.notOk(component.administrators[0].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.administrators[0].userNameInfo.fullName, 'a b. person');
    assert.notOk(component.administrators[0].userNameInfo.hasAdditionalInfo);
    assert.notOk(component.administrators[1].userStatus.accountIsDisabled);
    assert.strictEqual(component.administrators[1].userNameInfo.fullName, 'adam ant');
    assert.ok(component.administrators[1].userNameInfo.hasAdditionalInfo);
    await component.administrators[1].userNameInfo.expandTooltip();
    assert.strictEqual(
      component.administrators[1].userNameInfo.tooltipContents,
      'Campus name of record: stuart leslie goddard',
    );
    await component.administrators[1].userNameInfo.closeTooltip();
    assert.notOk(component.administrators[2].userStatus.accountIsDisabled);
    assert.notOk(component.administrators[2].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.administrators[2].userNameInfo.fullName, 'b a. person');
    assert.notOk(component.administrators[2].userNameInfo.hasAdditionalInfo);

    assert.strictEqual(component.studentAdvisors.length, 2);
    assert.notOk(component.studentAdvisors[0].userStatus.accountIsDisabled);
    assert.strictEqual(component.studentAdvisors[0].userNameInfo.fullName, 'adam ant');
    assert.ok(component.studentAdvisors[0].userNameInfo.hasAdditionalInfo);
    await component.studentAdvisors[0].userNameInfo.expandTooltip();
    assert.strictEqual(
      component.studentAdvisors[0].userNameInfo.tooltipContents,
      'Campus name of record: stuart leslie goddard',
    );
    await component.studentAdvisors[0].userNameInfo.closeTooltip();
    assert.notOk(component.studentAdvisors[1].userStatus.accountIsDisabled);
    assert.notOk(component.studentAdvisors[1].userNameInfo.hasAdditionalInfo);
    assert.strictEqual(component.studentAdvisors[1].userNameInfo.fullName, 'b a. person');
    assert.notOk(component.studentAdvisors[1].userNameInfo.hasAdditionalInfo);
  });

  test('it renders without directors', async function (assert) {
    this.set('administrators', [this.user1]);
    this.set('studentAdvisors', [this.user1]);

    await render(
      <template>
        <LeadershipList
          @showDirectors={{false}}
          @showAdministrators={{true}}
          @administrators={{this.administrators}}
          @showStudentAdvisors={{true}}
          @studentAdvisors={{this.studentAdvisors}}
        />
      </template>,
    );
    assert.strictEqual(component.administrators.length, 1);
    assert.strictEqual(component.administrators[0].userNameInfo.fullName, 'a b. person');
    assert.strictEqual(component.studentAdvisors.length, 1);
    assert.strictEqual(component.studentAdvisors[0].userNameInfo.fullName, 'a b. person');
  });

  test('it renders without administrators', async function (assert) {
    this.set('directors', [this.user1]);
    this.set('studentAdvisors', [this.user1]);

    await render(
      <template>
        <LeadershipList
          @showAdministrators={{false}}
          @showDirectors={{true}}
          @directors={{this.directors}}
          @showStudentAdvisors={{true}}
          @studentAdvisors={{this.studentAdvisors}}
        />
      </template>,
    );
    assert.strictEqual(component.directors.length, 1);
    assert.strictEqual(component.directors[0].userNameInfo.fullName, 'a b. person');
    assert.strictEqual(component.studentAdvisors.length, 1);
    assert.strictEqual(component.studentAdvisors[0].userNameInfo.fullName, 'a b. person');
  });

  test('it renders without student advisors', async function (assert) {
    this.set('directors', [this.user1]);
    this.set('administrators', [this.user1]);

    await render(
      <template>
        <LeadershipList
          @showDirectors={{true}}
          @directors={{this.directors}}
          @showAdministrators={{true}}
          @administrators={{this.administrators}}
          @showStudentAdvisors={{false}}
        />
      </template>,
    );
    assert.strictEqual(component.directors.length, 1);
    assert.strictEqual(component.directors[0].userNameInfo.fullName, 'a b. person');
    assert.strictEqual(component.administrators.length, 1);
    assert.strictEqual(component.administrators[0].userNameInfo.fullName, 'a b. person');
  });

  test('it renders without data', async function (assert) {
    this.set('directors', []);
    this.set('administrators', []);
    this.set('studentAdvisors', []);

    await render(
      <template>
        <LeadershipList
          @directors={{this.directors}}
          @administrators={{this.administrators}}
          @studentAdvisors={{this.studentAdvisors}}
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
        />
      </template>,
    );
    assert.strictEqual(component.directors.length, 1);
    assert.strictEqual(component.directors[0].text, 'None');
    assert.strictEqual(component.administrators.length, 1);
    assert.strictEqual(component.administrators[0].text, 'None');
    assert.strictEqual(component.studentAdvisors.length, 1);
    assert.strictEqual(component.studentAdvisors[0].text, 'None');
  });
});
