import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | school session types collapsed', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
    const school = this.server.create('school');
    this.server.create('session-type', {
      school,
      assessment: true,
    });
    this.server.create('session-type', {
      school,
      assessment: false,
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolSessionTypesCollapsed @school={{this.school}} @expand={{noop}} />`);

    const title = '.title';
    const table = 'table';
    const assessmentMethodRow = `${table} tbody tr:nth-of-type(1)`;
    const instructionalMethodRow = `${table} tbody tr:nth-of-type(2)`;
    const assessmentTitle = `${assessmentMethodRow} td:nth-of-type(1)`;
    const assessmentCount = `${assessmentMethodRow} td:nth-of-type(2)`;
    const instructionalTitle = `${instructionalMethodRow} td:nth-of-type(1)`;
    const instructionalCount = `${instructionalMethodRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Session Types');
    assert.dom(assessmentTitle).hasText('Assessment Methods');
    assert.dom(assessmentCount).hasText('1');
    assert.dom(instructionalTitle).hasText('Instructional Methods');
    assert.dom(instructionalCount).hasText('1');

  });
});
