import EmberObject from '@ember/object';
import { resolve } from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | program leadership expanded', function(hooks) {
  setupRenderingTest(hooks);


  test('it renders', async function(assert) {
    assert.expect(4);

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
    let program = EmberObject.create({
      directors: resolve([user1, user2]),
      hasMany(what){
        if (what === 'directors') {
          return {
            ids(){
              return [1, 2];
            }
          };
        }
        assert.ok(false);
      }
    });

    this.set('program', program);
    this.set('nothing', parseInt);
    await render(hbs`{{program-leadership-expanded
      program=program
      canUpdate=true
      collapse=(action nothing)
      expand=(action nothing)
      isManaging=false
      setIsManaging=(action nothing)
    }}`);
    const title = '.title';
    const table = 'table';
    const directors = `${table} tbody tr:nth-of-type(1) td:nth-of-type(1) li`;
    const firstDirector = `${directors}:nth-of-type(1)`;
    const secondDirector = `${directors}:nth-of-type(2)`;

    assert.dom(title).hasText('Program Leadership');
    assert.dom(directors).exists({ count: 2 });
    assert.dom(firstDirector).hasText('a b person');
    assert.dom(secondDirector).hasText('b a person');
  });

  test('clicking the header collapses', async function(assert) {
    assert.expect(1);
    let program = EmberObject.create({
      directors: resolve([]),
      hasMany(what){
        if (what === 'directors') {
          return {
            ids(){
              return [];
            }
          };
        }
      }
    });

    this.set('program', program);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{program-leadership-expanded
      program=program
      canUpdate=true
      collapse=(action click)
      expand=(action nothing)
      isManaging=false
      setIsManaging=(action nothing)
    }}`);
    const title = '.title';

    await click(title);
  });

  test('clicking manage fires action', async function(assert) {
    assert.expect(1);
    let program = EmberObject.create({
      directors: resolve([]),
      hasMany(what){
        if (what === 'directors') {
          return {
            ids(){
              return [];
            }
          };
        }
      }
    });

    this.set('program', program);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{program-leadership-expanded
      program=program
      canUpdate=true
      collapse=(action nothing)
      expand=(action nothing)
      isManaging=false
      setIsManaging=(action click)
    }}`);
    const manage = '.actions button';

    await click(manage);
  });
});
