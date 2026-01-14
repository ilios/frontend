import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMSW } from 'ilios-common/msw';
import { component } from 'frontend/tests/pages/components/reports/curriculum/tagged-terms';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { graphQL } from 'frontend/tests/helpers/curriculum-report';
import TaggedTerms from 'frontend/components/reports/curriculum/tagged-terms';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | reports/curriculum/tagged-terms', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(async function () {
    const school = await this.server.create('school', { title: 'school 0' });
    this.vocabulary = await this.server.create('vocabulary');

    const courseTerm1 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'course term 1',
    });
    const courseTerm2 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'course term 2',
    });
    const sessionTerm1 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'session term 1',
    });
    const sessionTerm2 = await this.server.create('term', {
      vocabulary: this.vocabulary,
      title: 'session term 2',
    });

    this.course = await this.server.create('course', {
      school,
      terms: [courseTerm1, courseTerm2],
    });
    const sessionType = await this.server.create('sessionType');
    this.session = await this.server.create('session', {
      course: this.course,
      sessionType,
      terms: [sessionTerm1, sessionTerm2],
    });

    await this.server.post('api/graphql', (schema) => {
      //use all the courses, getting the id filter from graphQL is a bit tricky
      const courseIds = schema.db.courses.map((c) => c.id);
      const rawCourses = courseIds.map((id) => graphQL.fetchCourse(schema.db, id));
      const courses = rawCourses.map((course) => {
        course.terms = schema.db.terms
          .filter((t) => t.courseIds?.includes(course.id))
          .map(({ id, title }) => {
            (id, title);
          });

        course.sessions.forEach((session) => {
          session.terms = schema.db.terms
            .filter((t) => t.sessionIds?.includes(session.id))
            .map(({ id, title }) => ({ id, title }));
        });

        return course;
      });

      return { data: { courses } };
    });
  });

  test('it renders and is accessible', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);

    await render(
      <template>
        <TaggedTerms
          @courses={{this.courses}}
          @selectedSchoolIds={{array "1"}}
          @countSelectedSchools={{1}}
          @hasMultipleSchools={{false}}
          @close={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Tagged Terms report for one course. Each set of attached terms is listed along with course data.',
      'report summary text is correct',
    );

    assert.strictEqual(component.results.length, 1, 'report results count is correct');
    assert.strictEqual(
      component.results.objectAt(0).courseTitle,
      'course 0',
      'first report result course title is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).courseTermsCount,
      '2',
      'first report result course terms count is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).sessionCount,
      '1',
      'first report result session count is correct',
    );
    assert.strictEqual(
      component.results.objectAt(0).sessionTermsCount,
      '2',
      'first report result session terms count is correct',
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('download report', async function (assert) {
    const courseModels = await this.owner.lookup('service:store').findAll('course');
    this.set('courses', courseModels);
    this.set('options', [
      {
        title: 'Grouped',
        tooltip: 'All terms in course/session on one row',
        filename: 'terms-grouped.csv',
      },
      {
        title: 'Listed',
        tooltip: 'Each course/session term on separate row',
        filename: 'terms-listed.csv',
      },
    ]);

    await render(
      <template>
        <TaggedTerms @courses={{this.courses}} @options={{this.options}} @close={{(noop)}} />
      </template>,
    );

    assert.strictEqual(
      component.header.runSummaryText,
      'Run Tagged Terms report for one course. Each set of attached terms is listed along with course data.',
      'report header text correct',
    );

    await component.header.downloadDropdown.toggle();

    await assert.strictEqual(
      component.header.downloadDropdown.menu.items.length,
      2,
      'download dropdown menu has correct item count',
    );
    assert.strictEqual(component.header.downloadDropdown.menu.items[0].text, 'Grouped');
    assert.strictEqual(component.header.downloadDropdown.menu.items[1].text, 'Listed');
  });
});
