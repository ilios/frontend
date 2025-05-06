import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/leadership-collapsed';
import LeadershipCollapsed from 'ilios-common/components/leadership-collapsed';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | leadership collapsed', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('studentAdvisorsCount', 4);
    await render(
      <template>
        <LeadershipCollapsed
          @title={{this.title}}
          @showAdministrators={{true}}
          @showDirectors={{true}}
          @showStudentAdvisors={{true}}
          @directorsCount={{this.directorsCount}}
          @administratorsCount={{this.administratorsCount}}
          @studentAdvisorsCount={{this.studentAdvisorsCount}}
          @expand={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Leadership (8)');
    assert.strictEqual(component.summary.length, 3);
    assert.strictEqual(component.summary[0].name, 'Directors');
    assert.strictEqual(component.summary[0].value, 'There are 3 directors');
    assert.strictEqual(component.summary[1].name, 'Administrators');
    assert.strictEqual(component.summary[1].value, 'There is 1 administrator');
    assert.strictEqual(component.summary[2].name, 'Student Advisors');
    assert.strictEqual(component.summary[2].value, 'There are 4 student advisors');
  });

  test('clicking the header expands the list', async function (assert) {
    assert.expect(1);

    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(<template><LeadershipCollapsed @expand={{this.click}} /></template>);
    await component.expand();
  });

  test('it renders without directors and student advisors', async function (assert) {
    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 2);
    this.set('studentAdvisorsCount', 4);
    await render(
      <template>
        <LeadershipCollapsed
          @title={{this.title}}
          @showAdministrators={{true}}
          @directorsCount={{this.directorsCount}}
          @administratorsCount={{this.administratorsCount}}
          @studentAdvisorsCount={{this.studentAdvisorsCount}}
          @expand={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Leadership (2)');
    assert.strictEqual(component.summary.length, 1);
    assert.strictEqual(component.summary[0].name, 'Administrators');
    assert.strictEqual(component.summary[0].value, 'There are 2 administrators');
  });

  test('it renders without administrators and student advisors', async function (assert) {
    this.set('title', 'Test Title');
    this.set('directorsCount', 1);
    this.set('administratorsCount', 3);
    this.set('studentAdvisorsCount', 4);
    await render(
      <template>
        <LeadershipCollapsed
          @title={{this.title}}
          @showDirectors={{true}}
          @directorsCount={{this.directorsCount}}
          @administratorsCount={{this.administratorsCount}}
          @studentAdvisorsCount={{this.studentAdvisorsCount}}
          @expand={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Leadership (1)');
    assert.strictEqual(component.summary.length, 1);
    assert.strictEqual(component.summary[0].name, 'Directors');
    assert.strictEqual(component.summary[0].value, 'There is 1 director');
  });

  test('it renders without directors and and administrators', async function (assert) {
    this.set('title', 'Test Title');
    this.set('directorsCount', 2);
    this.set('administratorsCount', 3);
    this.set('studentAdvisorsCount', 1);
    await render(
      <template>
        <LeadershipCollapsed
          @title={{this.title}}
          @showStudentAdvisors={{true}}
          @directorsCount={{this.directorsCount}}
          @administratorsCount={{this.administratorsCount}}
          @studentAdvisorsCount={{this.studentAdvisorsCount}}
          @expand={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.title, 'Leadership (1)');
    assert.strictEqual(component.summary.length, 1);
    assert.strictEqual(component.summary[0].name, 'Student Advisors');
    assert.strictEqual(component.summary[0].value, 'There is 1 student advisor');
  });

  test('it renders empty', async function (assert) {
    this.set('title', 'Test Title');
    await render(
      <template><LeadershipCollapsed @title={{this.title}} @expand={{(noop)}} /></template>,
    );
    assert.strictEqual(component.title, 'Leadership (0)');
    assert.strictEqual(component.summary.length, 0);
  });
});
