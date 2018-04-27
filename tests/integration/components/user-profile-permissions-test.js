import { module, skip } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import moment from 'moment';
import EmberObject from '@ember/object';
import { resolve } from 'rsvp';

module('Integration | Component | user-profile-permissions', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.schools = this.server.createList('school', 2);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('academic-year', { id: thisYear - 1 });
    this.server.create('academic-year', { id: thisYear });
    this.server.create('academic-year', { id: thisYear + 1 });
  });

  skip('it renders', async function (assert) {
    //need to figure out how to get the school from the store here instead of the model from mirage
    const user = EmberObject.create({
      school: resolve(this.schools[0])
    });
    this.set('user', user);
    await render(hbs`{{user-profile-permissions user=user}}`);

    assert.equal(this.element.textContent.trim(), '');

    await this.pauseTest();
  });
});
