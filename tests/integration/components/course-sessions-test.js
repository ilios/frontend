import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | course sessions', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const title = '.title';
    const course = EmberObject.create({
      hasMany() {
        return {
          ids(){
            return [];
          }
        };
      }
    });

    this.set('course', course);
    this.set('nothing', ()=>{});
    await render(hbs`{{course-sessions
      course=course
      sortBy='title'
      setSortBy=(action nothing)
      filterBy=null
      setFilterBy=(action nothing)
    }}`);

    assert.dom(title).hasText('Sessions (0)');
  });
});
