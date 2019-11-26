import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component } from 'ilios-common/page-objects/components/course-leadership-expanded';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course leadership expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(6);
    const users = this.server.createList('user', 2);
    const course = this.server.create('course', {
      directors: [users[0]],
      administrators: users,
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('nothing', () => {});
    await render(hbs`<CourseLeadershipExpanded
      @course={{course}}
      @editable={{true}}
      @collapse={{this.nothing}}
      @expand={{this.nothing}}
      @isManaging={{false}}
      @setIsManaging={{this.nothing}}
    />`);

    assert.equal(component.title, 'Course Leadership');
    assert.equal(component.leadershipList.directors.length, 1);
    assert.equal(component.leadershipList.directors[0].text, '0 guy M. Mc0son');
    assert.equal(component.leadershipList.administrators.length, 2);
    assert.equal(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
    assert.equal(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
  });

  test('clicking the header collapses when there are administrators', async function(assert) {
    assert.expect(1);
    const administrators = this.server.createList('user', 1);
    const course = this.server.create('course', {
      administrators
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', () => {});
    await render(hbs`<CourseLeadershipExpanded
      @course={{course}}
      @editable={{true}}
      @collapse={{action click}}
      @expand={{this.nothing}}
      @isManaging={{false}}
      @setIsManaging={{this.nothing}}
    />`);
    await component.collapse();
  });

  test('clicking the header collapses when there are directors', async function(assert) {
    assert.expect(1);
    const directors = this.server.createList('user', 1);
    const course = this.server.create('course', {
      directors
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', () => {});
    await render(hbs`<CourseLeadershipExpanded
      @course={{course}}
      @editable={{true}}
      @collapse={{action click}}
      @expand={{this.nothing}}
      @isManaging={{false}}
      @setIsManaging={{this.nothing}}
    />`);
    await component.collapse();
  });

  test('clicking the header does not collapse where there are no linked leaders', async function(assert) {
    assert.expect(0);
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(false);
    });
    this.set('nothing', () => {});
    await render(hbs`<CourseLeadershipExpanded
      @course={{course}}
      @editable={{true}}
      @collapse={{action click}}
      @expand={{this.nothing}}
      @isManaging={{false}}
      @setIsManaging={{this.nothing}}
    />`);
    await component.collapse();
  });

  test('clicking manage fires action', async function(assert) {
    assert.expect(1);
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', () => {});
    await render(hbs`<CourseLeadershipExpanded
      @course={{course}}
      @editable={{true}}
      @collapse={{this.nothing}}
      @expand={{this.nothing}}
      @isManaging={{false}}
      @setIsManaging={{action click}}
    />`);
    await component.manage();
  });
});
