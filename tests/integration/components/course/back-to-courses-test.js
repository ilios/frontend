import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | course/back-to-courses', function (hooks) {
  setupRenderingTest(hooks);

  // @todo figure out how to add a courses route so we can test [JJ 2022/6/9]
  test('it renders', async function (assert) {
    await render(hbs`<Course::BackToCourses />`);

    assert.dom(this.element).hasText('');
  });
});
