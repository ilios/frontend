import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

module('Integration | Component | school session types collapsed', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };

    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    assert.expect(5);
    const instructionalMethod = EmberObject.create({
      assessment: false
    });
    const assessmentMethod = EmberObject.create({
      assessment: true
    });

    const school = EmberObject.create({
      sessionTypes: resolve([instructionalMethod, assessmentMethod])
    });


    this.set('school', school);
    this.actions.click = parseInt;
    await render(hbs`{{school-session-types-collapsed school=school expand=(action 'click')}}`);

    await settled();
    const title = '.title';
    const table = 'table';
    const assessmentMethodRow = `${table} tbody tr:eq(0)`;
    const instructionalMethodRow = `${table} tbody tr:eq(1)`;
    const assessmentTitle = `${assessmentMethodRow} td:eq(0)`;
    const assessmentCount = `${assessmentMethodRow} td:eq(1)`;
    const instructionalTitle = `${instructionalMethodRow} td:eq(0)`;
    const instructionalCount = `${instructionalMethodRow} td:eq(1)`;

    assert.equal(find(title).textContent.trim(), 'Session Types');
    assert.equal(this.$(assessmentTitle).text().trim(), 'Assessment Methods');
    assert.equal(this.$(assessmentCount).text().trim(), '1');
    assert.equal(this.$(instructionalTitle).text().trim(), 'Instructional Methods');
    assert.equal(this.$(instructionalCount).text().trim(), '1');

  });
});
