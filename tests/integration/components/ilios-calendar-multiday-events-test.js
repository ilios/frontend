import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module(
  'Integration | Component | ilios calendar multiday events',
  function (hooks) {
    setupRenderingTest(hooks);

    skip('it renders', function (assert) {
      // Set any properties with this.set('myProperty', 'value');
      // Handle any actions with this.on('myAction', function(val) { ... });

      render(hbs`<IliosCalendarMultidayEvents />`);

      assert.dom(this.element).hasText('');
    });
  }
);
