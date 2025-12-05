import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/detail-competencies';
import DetailCompetencies from 'ilios-common/components/detail-competencies';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | detail-competencies', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);
  hooks.beforeEach(async function () {
    const school = await this.server.create('school');
    const program = await this.server.create('program', { school });
    const programYear = await this.server.create('program-year', { program });
    await this.server.create('cohort', { programYear });
    const domains = await this.server.createList('competency', 2, { school });

    const competencies = await Promise.all(
      domains
        .map((domain) => {
          return this.server.createList('competency', 2, {
            parent: domain,
            school,
            programYears: [programYear],
          });
        })
        .flat(),
    );
    const programYearObjectives = await Promise.all(
      competencies
        .map((competency) => {
          return this.server.create('program-year-objective', {
            competency,
            programYear,
          });
        })
        .flat(),
    );
    const course = await this.server.create('course', {
      school,
    });
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjectives[0]],
    });
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjectives[2]],
    });
    await this.server.create('course-objective', {
      course,
      programYearObjectives: [programYearObjectives[1], programYearObjectives[3]],
    });

    this.courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
  });

  test('it renders and is accessible', async function (assert) {
    this.set('course', this.courseModel);
    await render(
      <template>
        <DetailCompetencies
          @course={{this.course}}
          @editable={{false}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.domains.length, 2);
    assert.strictEqual(component.domains[0].text, 'competency 0 competency 2 competency 3');
    assert.strictEqual(component.domains[0].competencies.length, 2);
    assert.strictEqual(component.domains[1].text, 'competency 1 competency 4 competency 5');
    assert.strictEqual(component.domains[1].competencies.length, 2);

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });
});
