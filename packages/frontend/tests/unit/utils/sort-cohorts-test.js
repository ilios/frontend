import sortCohorts from 'frontend/utils/sort-cohorts';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { setupMirage } from 'frontend/tests/test-support/mirage';

module('Unit | Utility | sort-cohorts', function (hooks) {
  setupTest(hooks);
  setupMirage(hooks);

  test('it works', async function (assert) {
    const school1 = this.server.create('school');
    const school2 = this.server.create('school');
    const program1 = this.server.create('program', { school: school1 });
    const program2 = this.server.create('program', { school: school2 });
    const programYear1 = this.server.create('program-year', { program: program1 });
    const programYear2 = this.server.create('program-year', { program: program2 });
    const programYear3 = this.server.create('program-year', { program: program1 });
    const programYear4 = this.server.create('program-year', { program: program2 });

    const cohort1 = this.server.create('cohort', { programYear: programYear1 });
    const cohort2 = this.server.create('cohort', { programYear: programYear2 });
    const cohort3 = this.server.create('cohort', { programYear: programYear3 });
    const cohort4 = this.server.create('cohort', { programYear: programYear4 });

    const cohortModel1 = await this.owner.lookup('service:store').findRecord('cohort', cohort1.id);
    const cohortModel2 = await this.owner.lookup('service:store').findRecord('cohort', cohort2.id);
    const cohortModel3 = await this.owner.lookup('service:store').findRecord('cohort', cohort3.id);
    const cohortModel4 = await this.owner.lookup('service:store').findRecord('cohort', cohort4.id);

    let sortedCohorts = await sortCohorts([cohortModel1, cohortModel2, cohortModel3, cohortModel4]);
    assert.strictEqual(sortedCohorts[0], cohortModel1);
    assert.strictEqual(sortedCohorts[1], cohortModel3);
    assert.strictEqual(sortedCohorts[2], cohortModel2);
    assert.strictEqual(sortedCohorts[3], cohortModel4);
  });
});
