import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | leadership list', function(hooks) {
  setupRenderingTest(hooks);


  test('it renders with data', async function(assert) {
    assert.expect(5);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    let user2 = EmberObject.create({
      firstName: 'b',
      lastName: 'person',
      fullName: 'b a person',
    });
    this.set('directors', [user1]);
    this.set('administrators', [user2, user1]);

    await render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b person');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(findAll(administrators)[0]).hasText('a b person');
    assert.dom(findAll(administrators)[1]).hasText('b a person');
  });

  test('it renders without directors', async function(assert) {
    assert.expect(2);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    this.set('administrators', [user1]);

    await render(hbs`{{leadership-list showDirectors=false administrators=administrators}}`);
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';

    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('a b person');
  });

  test('it renders without administrators', async function(assert) {
    assert.expect(2);
    let user1 = EmberObject.create({
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    this.set('directors', [user1]);

    await render(hbs`{{leadership-list showAdministrators=false directors=directors}}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('a b person');
  });

  test('it renders without data', async function(assert) {
    assert.expect(4);
    this.set('directors', []);
    this.set('administrators', []);

    await render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';

    assert.dom(directors).exists({ count: 1 });
    assert.dom(findAll(directors)[0]).hasText('None');
    assert.dom(administrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('None');
  });

  test('disabled users are indicated with an icon', async function(assert) {
    assert.expect(7);
    let user1 = EmberObject.create({
      enabled: true,
      firstName: 'a',
      lastName: 'person',
      fullName: 'a b person',
    });
    let user2 = EmberObject.create({
      enabled: false,
      firstName: 'b',
      lastName: 'person',
      fullName: 'b a person',
    });
    this.set('directors', [user1]);
    this.set('administrators', [user2, user1]);

    await render(hbs`{{leadership-list directors=directors administrators=administrators}}`);
    const directors = 'table tbody tr:nth-of-type(1) td:nth-of-type(1) li';
    const administrators = 'table tbody tr:nth-of-type(1) td:nth-of-type(2) li';
    const disabledDirectors = `${directors} .fa-user-times`;
    const disabledAdministrators = `${administrators} .fa-user-times`;

    assert.dom(directors).exists({ count: 1 });
    assert.dom(disabledDirectors).doesNotExist();
    assert.dom(findAll(directors)[0]).hasText('a b person');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(disabledAdministrators).exists({ count: 1 });
    assert.dom(findAll(administrators)[0]).hasText('a b person');
    assert.dom(findAll(administrators)[1]).hasText('b a person');
  });
});
