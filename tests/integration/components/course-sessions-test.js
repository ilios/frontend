import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | course sessions', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const title = '.title';
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const courseModel = await this.owner.lookup('service:store').find('course', course.id);

    this.set('course', courseModel);
    this.set('nothing', () => {});
    await render(hbs`<CourseSessions
      @course={{course}}
      @sortBy="title"
      @setSortBy={{action nothing}}
      @filterBy={{null}}
      @setFilterBy={{action nothing}}
    />`);

    assert.dom(title).hasText('Sessions (0)');
  });
});
