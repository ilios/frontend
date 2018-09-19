import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  click,
  findAll
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | course director manager', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const fakeUser1 = EmberObject.create({fullName: 'test person 1'});
    const fakeUser2 = EmberObject.create({fullName: 'test person 2'});

    this.set('nothing', parseInt);
    this.set('users', [fakeUser1, fakeUser2]);

    await render(hbs`{{course-director-manager
      directors=users
      save=(action nothing)
      close=(action nothing)
    }}`);

    assert.dom('li').hasText('test person 1');
    assert.dom(findAll('li')[1]).hasText('test person 2');
  });

  test('can remove users', async function(assert) {
    assert.expect(4);
    const fakeUser1 = EmberObject.create({fullName: 'test person 1'});
    const fakeUser2 = EmberObject.create({fullName: 'test person 2'});

    const user1 = 'li:nth-of-type(1)';
    const user2 = 'li:nth-of-type(2)';
    const saveButton = 'button.bigadd';

    this.set('nothing', parseInt);
    this.set('save', (users) => {
      assert.equal(users.length, 1);
      assert.equal(users[0].get('fullName'), 'test person 2');
    });
    this.set('users', [fakeUser1, fakeUser2]);

    await render(hbs`{{course-director-manager
      directors=users
      save=(action save)
      close=(action nothing)
    }}`);

    assert.dom(user1).hasText('test person 1');
    assert.dom(user2).hasText('test person 2');

    await click(user1);

    return settled(await click(saveButton));
  });

  test('it closes', async function(assert) {
    assert.expect(1);
    this.set('nothing', parseInt);
    this.set('close', () => {
      assert.ok(true);
    });

    await render(hbs`{{course-director-manager
      save=(action nothing)
      close=(action close)
    }}`);

    await click('.bigcancel');
  });
});
