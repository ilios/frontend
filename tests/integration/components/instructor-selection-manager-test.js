import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/instructor-selection-manager';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | instructor selection manager', function (hooks) {
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
    const instructor3 = this.server.create('user', {
      displayName: 'Aardvark',
    });
    const group1 = this.server.create('instructorGroup', {
      users: [instructor1],
      title: 'Beta',
    });
    const group2 = this.server.create('instructorGroup', {
      users: [instructor2, instructor3],
      title: 'Alpha',
    });
    const group3 = this.server.create('instructorGroup', { title: 'Gamma' });
    this.instructor1 = await this.owner.lookup('service:store').findRecord('user', instructor1.id);
    this.instructor2 = await this.owner.lookup('service:store').findRecord('user', instructor2.id);
    this.instructor3 = await this.owner.lookup('service:store').findRecord('user', instructor3.id);
    this.group1 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', group1.id);
    this.group2 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', group2.id);
    this.group3 = await this.owner
      .lookup('service:store')
      .findRecord('instructor-group', group3.id);
  });

  test('it renders', async function (assert) {
    this.set('instructors', [this.instructor1, this.instructor2, this.instructor3]);
    this.set('groups', [this.group1, this.group2]);
    this.set('availableGroups', []);
    await render(hbs`<InstructorSelectionManager
      @instructors={{this.instructors}}
      @instructorGroups={{this.groups}}
      @availableInstructorGroups={{this.availableGroups}}
      @addInstructor={{(noop)}}
      @addInstructorGroup={{(noop)}}
      @removeInstructor={{(noop)}}
      @removeInstructorGroup={{(noop)}}
    />
`);
    assert.strictEqual(component.selectedInstructors.instructors.length, 3);
    assert.strictEqual(
      component.selectedInstructors.instructors[0].userNameInfo.fullName,
      'Aardvark'
    );
    assert.notOk(component.selectedInstructors.instructors[0].userNameInfo.isTooltipVisible);
    await component.selectedInstructors.instructors[0].userNameInfo.expandTooltip();
    assert.ok(component.selectedInstructors.instructors[0].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.selectedInstructors.instructors[0].userNameInfo.tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await component.selectedInstructors.instructors[0].userNameInfo.closeTooltip();
    assert.strictEqual(
      component.selectedInstructors.instructors[1].userNameInfo.fullName,
      'Jane A. Doe'
    );
    assert.notOk(component.selectedInstructors.instructors[1].userNameInfo.isTooltipVisible);
    assert.strictEqual(
      component.selectedInstructors.instructors[2].userNameInfo.fullName,
      'Joe M. Doe'
    );
    assert.notOk(component.selectedInstructors.instructors[2].userNameInfo.isTooltipVisible);
    assert.strictEqual(component.selectedInstructorGroups.instructorGroups.length, 2);
    assert.strictEqual(component.selectedInstructorGroups.instructorGroups[0].title, 'Alpha');
    assert.strictEqual(component.selectedInstructorGroups.instructorGroups[0].members.length, 2);
    assert.strictEqual(
      component.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo.fullName,
      'Aardvark'
    );
    assert.notOk(
      component.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo
        .isTooltipVisible
    );
    await component.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo.expandTooltip();
    assert.ok(
      component.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo
        .isTooltipVisible
    );
    assert.strictEqual(
      component.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo
        .tooltipContents,
      'Campus name of record: 2 guy M, Mc2son'
    );
    await component.selectedInstructorGroups.instructorGroups[0].members[0].userNameInfo.closeTooltip();
    assert.strictEqual(
      component.selectedInstructorGroups.instructorGroups[0].members[1].userNameInfo.fullName,
      'Jane A. Doe'
    );
    assert.notOk(
      component.selectedInstructorGroups.instructorGroups[0].members[1].userNameInfo
        .isTooltipVisible
    );
    assert.strictEqual(component.selectedInstructorGroups.instructorGroups[1].members.length, 1);
    assert.strictEqual(
      component.selectedInstructorGroups.instructorGroups[1].members[0].userNameInfo.fullName,
      'Joe M. Doe'
    );
    assert.notOk(
      component.selectedInstructorGroups.instructorGroups[1].members[0].userNameInfo
        .isTooltipVisible
    );
    assert.strictEqual(component.selectedInstructorGroups.instructorGroups[1].title, 'Beta');
  });

  test('remove selected instructor', async function (assert) {
    assert.expect(1);
    this.set('instructors', [this.instructor1]);
    this.set('groups', []);
    this.set('availableGroups', []);
    this.set('removeInstructor', (instructor) => {
      assert.strictEqual(instructor, this.instructor1);
    });
    await render(hbs`<InstructorSelectionManager
      @instructors={{this.instructors}}
      @instructorGroups={{this.groups}}
      @availableInstructorGroups={{this.availableGroups}}
      @addInstructor={{(noop)}}
      @addInstructorGroup={{(noop)}}
      @removeInstructor={{this.removeInstructor}}
      @removeInstructorGroup={{(noop)}}
    />
`);
    await component.selectedInstructors.instructors[0].remove();
  });

  test('remove selected instructor group', async function (assert) {
    assert.expect(1);
    this.set('instructors', []);
    this.set('groups', [this.group1]);
    this.set('availableGroups', []);
    this.set('removeGroup', (group) => {
      assert.strictEqual(group, this.group1);
    });
    await render(hbs`<InstructorSelectionManager
      @instructors={{this.instructors}}
      @instructorGroups={{this.groups}}
      @availableInstructorGroups={{this.availableGroups}}
      @addInstructor={{(noop)}}
      @addInstructorGroup={{(noop)}}
      @removeInstructor={{(noop)}}
      @removeInstructorGroup={{this.removeGroup}}
    />
`);
    await component.selectedInstructorGroups.instructorGroups[0].remove();
  });

  test('search and add instructor group', async function (assert) {
    assert.expect(1);
    this.set('instructors', []);
    this.set('groups', []);
    this.set('availableGroups', [this.group3]);
    this.set('addGroup', (group) => {
      assert.strictEqual(group, this.group3);
    });
    await render(hbs`<InstructorSelectionManager
      @instructors={{this.instructors}}
      @instructorGroups={{this.groups}}
      @availableInstructorGroups={{this.availableGroups}}
      @addInstructor={{(noop)}}
      @addInstructorGroup={{this.addGroup}}
      @removeInstructor={{(noop)}}
      @removeInstructorGroup={{(noop)}}
    />
`);
    await component.search.searchBox.set('Gamma');
    await component.search.results.items[0].click();
  });

  test('search and add instructor', async function (assert) {
    assert.expect(1);
    this.server.get('api/users', (schema) => {
      return schema.users.all();
    });
    this.set('instructors', []);
    this.set('groups', []);
    this.set('availableGroups', []);
    this.set('addInstructor', (instructor) => {
      assert.strictEqual(instructor, this.instructor3);
    });
    await render(hbs`<InstructorSelectionManager
      @instructors={{this.instructors}}
      @instructorGroups={{this.groups}}
      @availableInstructorGroups={{this.availableGroups}}
      @addInstructor={{this.addInstructor}}
      @addInstructorGroup={{(noop)}}
      @removeInstructor={{(noop)}}
      @removeInstructorGroup={{(noop)}}
    />
`);
    await component.search.searchBox.set('Aardvark');
    await component.search.results.items[0].click();
  });
});
