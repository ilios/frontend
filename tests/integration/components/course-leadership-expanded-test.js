import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
const { resolve } = RSVP;

module('Integration | Component | course leadership expanded', function(hooks) {
  setupRenderingTest(hooks);


  test('it renders', async function(assert) {
    assert.expect(6);

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
    let course = EmberObject.create({
      directors: resolve([user1]),
      administrators: resolve([user1, user2]),
      hasMany(what){
        if (what === 'directors') {
          return {
            ids(){
              return [1];
            }
          };
        }
        if (what === 'administrators') {
          return {
            ids(){
              return [1, 2];
            }
          };
        }
      }
    });

    this.set('course', course);
    this.set('nothing', parseInt);
    await render(hbs`{{course-leadership-expanded
      course=course
      editable=true
      collapse=(action nothing)
      expand=(action nothing)
      isManaging=false
      setIsManaging=(action nothing)
    }}`);
    const title = '.title';
    const table = 'table';
    const directors = `${table} tbody tr:nth-of-type(1) td:nth-of-type(1) li`;
    const firstDirector = `${directors}:nth-of-type(1)`;
    const administrators = `${table} tbody tr:nth-of-type(1) td:nth-of-type(2) li`;
    const firstAdministrator = `${administrators}:nth-of-type(1)`;
    const secondAdministrator = `${administrators}:nth-of-type(2)`;

    assert.dom(title).hasText('Course Leadership');
    assert.dom(directors).exists({ count: 1 });
    assert.dom(firstDirector).hasText('a b person');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(firstAdministrator).hasText('a b person');
    assert.dom(secondAdministrator).hasText('b a person');
  });

  test('clicking the header collapses', async function(assert) {
    assert.expect(1);
    let course = EmberObject.create({
      directors: resolve([]),
      administrators: resolve([]),
      hasMany(what){
        if (what === 'directors') {
          return {
            ids(){
              return [];
            }
          };
        }
        if (what === 'administrators') {
          return {
            ids(){
              return [];
            }
          };
        }
      }
    });

    this.set('course', course);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{course-leadership-expanded
      course=course
      editable=true
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
    let course = EmberObject.create({
      directors: resolve([]),
      administrators: resolve([]),
      hasMany(what){
        if (what === 'directors') {
          return {
            ids(){
              return [];
            }
          };
        }
        if (what === 'administrators') {
          return {
            ids(){
              return [];
            }
          };
        }
      }
    });

    this.set('course', course);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    this.set('nothing', parseInt);
    await render(hbs`{{course-leadership-expanded
      course=course
      editable=true
      collapse=(action nothing)
      expand=(action nothing)
      isManaging=false
      setIsManaging=(action click)
    }}`);
    const manage = '.actions button';

    await click(manage);
  });
});
