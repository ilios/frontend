import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/course-leadership-expanded';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course leadership expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(8);
    const users = this.server.createList('user', 2);
    const course = this.server.create('course', {
      directors: [users[0]],
      administrators: users,
      studentAdvisors: [users[0]],
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    await render(hbs`<CourseLeadershipExpanded
      @course={{this.course}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);

    assert.strictEqual(component.title, 'Course Leadership');
    assert.strictEqual(component.leadershipList.directors.length, 1);
    assert.strictEqual(component.leadershipList.directors[0].text, '0 guy M. Mc0son');
    assert.strictEqual(component.leadershipList.administrators.length, 2);
    assert.strictEqual(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
    assert.strictEqual(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
    assert.strictEqual(component.leadershipList.studentAdvisors.length, 1);
    assert.strictEqual(component.leadershipList.studentAdvisors[0].text, '0 guy M. Mc0son');
  });

  test('clicking the header collapses when there are administrators', async function (assert) {
    assert.expect(1);
    const administrators = this.server.createList('user', 1);
    const course = this.server.create('course', {
      administrators,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CourseLeadershipExpanded
      @course={{this.course}}
      @editable={{true}}
      @collapse={{this.click}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse();
  });

  test('clicking the header collapses when there are directors', async function (assert) {
    assert.expect(1);
    const directors = this.server.createList('user', 1);
    const course = this.server.create('course', {
      directors,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CourseLeadershipExpanded
      @course={{this.course}}
      @editable={{true}}
      @collapse={{this.click}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse();
  });

  test('clicking the header collapses when there are student advisors', async function (assert) {
    assert.expect(1);
    const studentAdvisors = this.server.createList('user', 1);
    const course = this.server.create('course', {
      studentAdvisors,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CourseLeadershipExpanded
      @course={{this.course}}
      @editable={{true}}
      @collapse={{this.click}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse();
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CourseLeadershipExpanded
      @course={{this.course}}
      @editable={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{this.click}}
    />`);
    await component.manage();
  });
});
