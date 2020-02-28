import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | learnergroup instructor manager', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const school = this.server.create('school');
    const program = this.server.create('program', { school });
    const programYear = this.server.create('programYear', { program });
    this.cohort = this.server.create('cohort', { programYear });
    this.school = school;
  });

  test('it renders', async function(assert) {
    assert.expect(3);
    const instructor =  this.server.create('user', { firstName: 'test', lastName: 'person', middleName: '' });
    const instructorGroup = this.server.create('instructorGroup', { title: 'test group'});
    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [ instructor ],
      instructorGroups: [ instructorGroup ]
    });

    const learnerGroupModel = await this.owner.lookup('service:store').find('learnerGroup', learnerGroup.id);

    this.set('nothing', parseInt);
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupInstructorManager
      @learnerGroup={{this.learnerGroup}}
      @save={{action this.nothing}}
      @close={{action this.nothing}}
    />`);

    assert.dom('.removable-instructors li').exists({ count: 2 });
    assert.dom('.removable-instructors li:nth-of-type(1)').hasText('test person');
    assert.dom('.removable-instructors li:nth-of-type(2)').hasText('test group');
  });

  test('can remove groups', async function(assert) {
    assert.expect(5);
    const instructor =  this.server.create('user', { firstName: 'test', lastName: 'person', middleName: '' });
    const instructor2 =  this.server.create('user', { firstName: 'test', lastName: 'person 2', middleName: '' });
    const instructorGroup = this.server.create('instructorGroup', { title: 'test group'});
    const instructorGroup2 = this.server.create('instructorGroup', { title: 'test group 2'});

    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [ instructor, instructor2 ],
      instructorGroups: [ instructorGroup, instructorGroup2 ]
    });

    const learnerGroupModel = await this.owner.lookup('service:store').find('learnerGroup', learnerGroup.id);

    this.set('nothing', parseInt);
    this.set('save', (users, groups) => {
      assert.equal(users.length, 2);
      assert.equal(groups.length, 1);
      assert.equal(groups[0].get('title'), 'test group 2');
    });
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupInstructorManager
      @learnerGroup={{learnerGroup}}
      @save={{action save}}
      @close={{action nothing}}
    />`);

    assert.dom('.removable-instructors li:nth-of-type(3)').hasText('test group');
    assert.dom('.removable-instructors li:nth-of-type(4)').hasText('test group 2');

    await click('.removable-instructors li:nth-of-type(3)');
    await click('button.bigadd');
  });

  test('can remove users', async function(assert) {
    assert.expect(5);
    const instructor =  this.server.create('user', { firstName: 'test', lastName: 'person', middleName: '' });
    const instructor2 =  this.server.create('user', { firstName: 'test', lastName: 'person 2', middleName: '' });
    const instructorGroup = this.server.create('instructorGroup', { title: 'test group'});
    const instructorGroup2 = this.server.create('instructorGroup', { title: 'test group 2'});

    const learnerGroup = this.server.create('learnerGroup', {
      title: 'this group',
      cohort: this.cohort,
      instructors: [ instructor, instructor2 ],
      instructorGroups: [ instructorGroup, instructorGroup2 ]
    });

    const learnerGroupModel = await this.owner.lookup('service:store').find('learnerGroup', learnerGroup.id);

    this.set('nothing', parseInt);
    this.set('save', (users, groups) => {
      assert.equal(users.length, 1);
      assert.equal(groups.length, 2);
      assert.equal(users[0].get('fullName'), 'test person 2');
    });
    this.set('learnerGroup', learnerGroupModel);

    await render(hbs`<LearnergroupInstructorManager
      @learnerGroup={{learnerGroup}}
      @save={{action save}}
      @close={{action nothing}}
    />`);

    assert.dom('.removable-instructors li:nth-of-type(1)').hasText('test person');
    assert.dom('.removable-instructors li:nth-of-type(2)').hasText('test person 2');

    await click('.removable-instructors li:nth-of-type(1)');
    await click('button.bigadd');
  });

  test('it closes', async function(assert) {
    assert.expect(1);
    this.set('nothing', parseInt);
    this.set('close', () => {
      assert.ok(true);
    });

    await render(hbs`<LearnergroupInstructorManager
      @save={{action nothing}}
      @close={{action close}}
    />`);

    await click('.bigcancel');
  });
});
