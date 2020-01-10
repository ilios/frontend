import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupAuthentication } from 'ilios-common';

module('Integration | Component | session-publicationcheck', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it shows unlink icon', async function(assert) {
    const parent = this.server.create('objective');
    const objective1 = this.server.create('objective', { parents: [ parent ] });
    const objective2 = this.server.create('objective');
    const school = this.server.create('school');
    const course = this.server.create('course', { school });
    const session = this.server.create('session', {
      objectives: [ objective1, objective2 ],
      course
    });
    await setupAuthentication({ school, administeredSchools: [ school ]});
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('model', sessionModel);
    await render(hbs`<SessionPublicationcheck @session={{model}} />`);
    assert.ok(!!find('.fa-unlink'));
  });

  test('it does not shows unlink icon', async function(assert) {
    const parent = this.server.create('objective');
    const objective1 = this.server.create('objective', { parents: [ parent ] });
    const objective2 = this.server.create('objective', { parents: [ parent ] });
    const school = this.server.create('school');
    const course  = this.server.create('course', { school });
    const session = this.server.create('session', {
      objectives: [ objective1, objective2 ],
      course
    });
    await setupAuthentication({ school, administeredSchools: [ school ]});
    const sessionModel = await this.owner.lookup('service:store').find('session', session.id);
    this.set('model', sessionModel);
    await render(hbs`<SessionPublicationcheck @session={{model}} />`);
    assert.notOk(!!find('.fa-unlink'));
  });
});
