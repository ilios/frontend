import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/detail-instructors-list';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | detail instructors list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const instructor1 = this.server.create('user', {
      firstName: 'Joe',
      lastName: 'Doe',
      middleName: 'Michael',
    });
    const instructor2 = this.server.create('user', {
      firstName: 'Jane',
      lastName: 'Doe',
      middleName: 'Anette',
    });
    const instructor3 = this.server.create('user', { displayName: 'Aardvark' });

    const group1 = this.server.create('instructorGroup', {
      title: 'Beta',
      users: [instructor1],
    });
    const group2 = this.server.create('instructorGroup', {
      title: 'Alpha',
      users: [instructor2, instructor3],
    });

    this.instructor1 = await this.owner.lookup('service:store').find('user', instructor1.id);
    this.instructor2 = await this.owner.lookup('service:store').find('user', instructor2.id);
    this.instructor3 = await this.owner.lookup('service:store').find('user', instructor3.id);
    this.group1 = await this.owner.lookup('service:store').find('instructor-group', group1.id);
    this.group2 = await this.owner.lookup('service:store').find('instructor-group', group2.id);
  });

  test('it renders', async function (assert) {
    this.set('groups', [this.group1, this.group2]);
    this.set('instructors', [this.instructor1, this.instructor2, this.instructor3]);

    await render(
      hbs`<DetailInstructorsList @instructors={{this.instructors}} @instructorGroups={{this.groups}} />`
    );
    assert.strictEqual(component.instructors.length, 3);
    assert.strictEqual(component.instructors[0].userNameInfo.fullName, 'Aardvark');
    assert.notOk(component.instructors[0].userNameInfo.isTooltipVisible);
    await component.instructors[0].userNameInfo.expandTooltip();
    assert.ok(component.instructors[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.instructors[0].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await component.instructors[0].userNameInfo.closeTooltip();
    assert.strictEqual(component.instructors[1].userNameInfo.fullName, 'Jane A. Doe');
    assert.notOk(component.instructors[1].userNameInfo.isTooltipVisible);
    assert.strictEqual(component.instructors[2].userNameInfo.fullName, 'Joe M. Doe');
    assert.notOk(component.instructors[2].userNameInfo.isTooltipVisible);
    assert.strictEqual(component.instructorGroups.length, 2);
    assert.strictEqual(component.instructorGroups[0].title, 'Alpha');
    assert.strictEqual(component.instructorGroups[0].members.length, 2);
    assert.strictEqual(component.instructorGroups[0].members[0].userNameInfo.fullName, 'Aardvark');
    assert.notOk(component.instructorGroups[0].members[0].userNameInfo.isTooltipVisible);
    await component.instructorGroups[0].members[0].userNameInfo.expandTooltip();
    assert.ok(component.instructorGroups[0].members[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.instructorGroups[0].members[0].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await component.instructorGroups[0].members[0].userNameInfo.closeTooltip();
    assert.strictEqual(
      component.instructorGroups[0].members[1].userNameInfo.fullName,
      'Jane A. Doe'
    );
    assert.notOk(component.instructorGroups[0].members[1].userNameInfo.isTooltipVisible);
    assert.strictEqual(component.instructorGroups[1].members.length, 1);
    assert.strictEqual(
      component.instructorGroups[1].members[0].userNameInfo.fullName,
      'Joe M. Doe'
    );
    assert.notOk(component.instructorGroups[1].members[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(component.instructorGroups[1].title, 'Beta');
  });
});
