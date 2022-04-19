import { currentRouteName, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Program - Publication Check', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    await setupAuthentication({ school });
    const program = this.server.create('program', {
      startYear: 2013,
      school,
    });
    const programYear = this.server.create('programYear', { program });
    this.server.create('cohort', { programYear });
    this.fullProgram = program;
    this.emptyProgram = this.server.create('program', {
      startYear: 2013,
      school,
    });
  });

  test('full program count', async function (assert) {
    await visit('/programs/' + this.fullProgram.id + '/publicationcheck');
    assert.strictEqual(currentRouteName(), 'program.publication-check');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(1)')
      .hasText('program 0');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(2)')
      .hasText('short_0');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(3)')
      .hasText('4');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(4)')
      .hasText('Yes (1)');
  });

  test('empty program count', async function (assert) {
    await visit('/programs/' + this.emptyProgram.id + '/publicationcheck');
    assert.strictEqual(currentRouteName(), 'program.publication-check');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(1)')
      .hasText('program 1');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(2)')
      .hasText('short_1');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(3)')
      .hasText('4');
    assert
      .dom('.program-publication-check .detail-content table tbody td:nth-of-type(4)')
      .hasText('No');
  });
});
