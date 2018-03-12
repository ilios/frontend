import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('course-sessions', 'Integration | Component | course sessions', {
  integration: true
});

test('it renders', function(assert) {
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
  this.render(hbs`{{course-sessions
    course=course
    sortBy='title'
    setSortBy=(action nothing)
    filterBy=null
    setFilterBy=(action nothing)
  }}`);

  assert.equal(this.$(title).text().trim(), 'Sessions (0)');
});
