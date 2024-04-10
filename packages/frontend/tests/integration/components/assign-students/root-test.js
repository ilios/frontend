import { module, todo } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | assign-students/root', function (hooks) {
  setupRenderingTest(hooks);

  todo('it renders', async function (/* assert */) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<AssignStudents::Root />`);
  });
});
