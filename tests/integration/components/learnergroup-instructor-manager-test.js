import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | learnergroup instructor manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const learnerGroup = EmberObject.create({
      title: 'this group',
      instructors: resolve([
        EmberObject.create({
          fullName: 'test person'
        })
      ]),
      instructorGroups: resolve([EmberObject.create({
        title: 'test group'
      })]),
    });

    this.set('nothing', parseInt);
    this.set('learnerGroup', learnerGroup);

    await render(hbs`{{learnergroup-instructor-manager
      learnerGroup=learnerGroup
      save=(action nothing)
      close=(action nothing)
    }}`);

    assert.dom('li').hasText('test person |');
    assert.dom(findAll('li')[1]).hasText('test group |');
  });

  test('can remove groups', async function(assert) {
    assert.expect(5);
    const group1 = 'li:nth-of-type(3)';
    const group2 = 'li:nth-of-type(4)';
    const saveButton = 'button.bigadd';
    const learnerGroup = EmberObject.create({
      title: 'this group',
      instructors: resolve([
        EmberObject.create({
          fullName: 'test person'
        }),
        EmberObject.create({
          fullName: 'test person 2'
        })
      ]),
      instructorGroups: resolve([
        EmberObject.create({
          id: 42,
          title: 'test group'
        }),
        EmberObject.create({
          id: 'beans',
          title: 'test group 2'
        }),
      ]),
    });

    this.set('nothing', parseInt);
    this.set('save', (users, groups) => {
      assert.equal(users.length, 2);
      assert.equal(groups.length, 1);
      assert.equal(groups[0].get('title'), 'test group 2');
    });
    this.set('learnerGroup', learnerGroup);

    await render(hbs`{{learnergroup-instructor-manager
      learnerGroup=learnerGroup
      save=(action save)
      close=(action nothing)
    }}`);

    assert.dom(group1).hasText('test group |');
    assert.dom(group2).hasText('test group 2 |');

    await click(group1);

    return settled(await click(saveButton));
  });

  test('can remove users', async function(assert) {
    assert.expect(5);
    const user1 = 'li:nth-of-type(1)';
    const user2 = 'li:nth-of-type(2)';
    const saveButton = 'button.bigadd';
    const learnerGroup = EmberObject.create({
      title: 'this group',
      instructors: resolve([
        EmberObject.create({
          fullName: 'test person'
        }),
        EmberObject.create({
          fullName: 'test person 2'
        })
      ]),
      instructorGroups: resolve([
        EmberObject.create({
          id: 42,
          title: 'test group'
        }),
        EmberObject.create({
          id: 'beans',
          title: 'test group 2'
        }),
      ]),
    });

    this.set('nothing', parseInt);
    this.set('save', (users, groups) => {
      assert.equal(users.length, 1);
      assert.equal(users[0].get('fullName'), 'test person 2');
      assert.equal(groups.length, 2);
    });
    this.set('learnerGroup', learnerGroup);

    await render(hbs`{{learnergroup-instructor-manager
      learnerGroup=learnerGroup
      save=(action save)
      close=(action nothing)
    }}`);

    assert.dom(user1).hasText('test person |');
    assert.dom(user2).hasText('test person 2 |');

    await click(user1);

    return settled(await click(saveButton));
  });

  test('it closes', async function(assert) {
    assert.expect(1);
    this.set('nothing', parseInt);
    this.set('close', () => {
      assert.ok(true);
    });

    await render(hbs`{{learnergroup-instructor-manager
      save=(action nothing)
      close=(action close)
    }}`);

    await click('.bigcancel');
  });
});
