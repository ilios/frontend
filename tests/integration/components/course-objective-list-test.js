import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/course-objective-list';

module('Integration | Component | course objective list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(9);

    const objectives = this.server.createList('objective', 2);
    const course = this.server.create('course', {
      objectives
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('nothing', () => {});
    this.set('course', courseModel);

    await render(
      hbs`<CourseObjectiveList
        @course={{this.course}}
        @editable={{true}}
        @manageParents={{action this.nothing}}
        @manageDescriptors={{action this.nothing}}
      />`
    );

    assert.equal(component.objectives.length, 2);
    assert.ok(component.canSort);
    assert.equal(component.listHeadings.length, 4);
    assert.equal(component.listHeadings[0].text, 'Description');
    assert.equal(component.listHeadings[1].text, 'Parent Objectives');
    assert.equal(component.listHeadings[2].text, 'MeSH Terms');
    assert.equal(component.listHeadings[3].text, 'Actions');

    assert.equal(component.objectives[0].description.text, 'objective 0');
    assert.equal(component.objectives[1].description.text, 'objective 1');
  });

  test('empty list', async function (assert) {
    assert.expect(2);
    const course = this.server.create('course');
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);
    this.set('course', courseModel);
    await render(
      hbs`<CourseObjectiveList
        @course={{this.course}}
      />`
    );
    assert.ok(component.isVisible);
    assert.equal(component.text, '');
  });

  test('no "sort objectives" button in list with one item', async function(assert) {
    assert.expect(2);
    const objectives = this.server.createList('objective', 1);
    const course = this.server.create('course', {
      objectives
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('nothing', () => {});
    this.set('course', courseModel);

    await render(
      hbs`<CourseObjectiveList
        @course={{this.course}}
        @editable={{true}}
        @manageParents={{action this.nothing}}
        @manageDescriptors={{action this.nothing}}
      />`
    );
    assert.equal(component.objectives.length, 1);
    assert.notOk(component.canSort);
  });

  test('cancel removal', async function(assert) {
    assert.expect(4);
    const objectives = this.server.createList('objective', 1);
    const course = this.server.create('course', {
      objectives
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('nothing', () => {});
    this.set('course', courseModel);

    await render(
      hbs`<CourseObjectiveList
        @course={{this.course}}
        @editable={{true}}
        @manageParents={{action this.nothing}}
        @manageDescriptors={{action this.nothing}}
      />`
    );
    assert.equal(component.objectives.length, 1);
    await component.objectives[0].remove();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.cancel();
    assert.ok(component.confirmRemoval.isHidden);
    assert.equal(component.objectives.length, 1);
  });

  test('remove objective', async function(assert) {
    assert.expect(4);
    const objectives = this.server.createList('objective', 1);
    const course = this.server.create('course', {
      objectives
    });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('nothing', () => {});
    this.set('course', courseModel);

    await render(
      hbs`<CourseObjectiveList
        @course={{this.course}}
        @editable={{true}}
        @manageParents={{action this.nothing}}
        @manageDescriptors={{action this.nothing}}
      />`
    );
    assert.equal(component.objectives.length, 1);
    await component.objectives[0].remove();
    assert.ok(component.confirmRemoval.isVisible);
    await component.confirmRemoval.confirm();
    assert.ok(component.confirmRemoval.isHidden);
    assert.equal(component.objectives.length, 0);
  });
});
