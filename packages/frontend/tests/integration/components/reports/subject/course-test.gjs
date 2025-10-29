import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { click, render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/course';
import { setupAuthentication } from 'ilios-common';
import Course from 'frontend/components/reports/subject/course';

module('Integration | Component | reports/subject/course', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      courses: [
        { id: 1, title: 'First Course', year: 2023, school: { id: 1, title: 'First School' } },
        {
          id: 2,
          title: 'Second Course',
          year: 2020,
          externalId: 'ext ID 1',
          school: { id: 2, title: 'Second School' },
        },
      ],
    },
  };

  test('it renders for user with permissions', async function (assert) {
    await setupAuthentication({}, true);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'result length is correct');
    assert.strictEqual(
      component.results[0].year.title,
      '2023',
      'first result year text is correct',
    );
    assert.strictEqual(
      component.results[1].year.title,
      '2020',
      'second result year text is correct',
    );
    assert.ok(component.results[0].course.hasLink, 'first result has course link');
    assert.ok(component.results[1].course.hasLink, 'second result has course link');
    assert.strictEqual(
      component.results[0].course.title,
      'First Course',
      'first result has correct course title',
    );
    assert.strictEqual(
      component.results[1].course.title,
      'Second Course (ext ID 1)',
      'second result has correct course title',
    );
    assert.strictEqual(
      component.results[0].course.link,
      '/courses/1',
      'first result has correct course link',
    );
    assert.strictEqual(
      component.results[1].course.link,
      '/courses/2',
      'second result has correct course link',
    );
    assert.verifySteps(['API called']);
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].year.title, '2023');
    assert.strictEqual(component.results[1].year.title, '2020');
    assert.notOk(component.results[0].course.hasLink);
    assert.notOk(component.results[1].course.hasLink);
    assert.strictEqual(component.results[0].course.title, 'First Course');
    assert.strictEqual(component.results[1].course.title, 'Second Course (ext ID 1)');
    assert.verifySteps(['API called']);
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    await setupAuthentication({}, true);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'responseData shows all 2 of 2 courses');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
    assert.verifySteps(['API called']);
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    await setupAuthentication({}, true);

    const years = [2020, 2021, 2022, 2023, 2024, 2025];
    const responseDataLarge = {
      data: {
        courses: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.courses.push({
        id: i,
        title: `course ${i}`,
        year: years[Math.floor(Math.random() * years.length)],
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 courses',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
    assert.verifySteps(['API called']);
  });

  test('it renders school link if all schools is chosen', async function (assert) {
    await setupAuthentication({}, true);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.ok(component.results[0].school.isPresent);
    assert.strictEqual(component.results[0].school.title, 'First School:');
    assert.ok(component.results[1].school.isPresent);
    assert.strictEqual(component.results[1].school.title, 'Second School:');
    assert.verifySteps(['API called']);
  });

  test('it reads academic year config', async function (assert) {
    this.server.get('application/config', function () {
      assert.step('application/config API called');
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('api/graphql API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].year.title, '2023 - 2024');
    assert.strictEqual(component.results[1].year.title, '2020 - 2021');
    assert.strictEqual(component.results[0].course.title, 'First Course');
    assert.strictEqual(component.results[1].course.title, 'Second Course (ext ID 1)');
    assert.verifySteps(['application/config API called', 'api/graphql API called']);
  });

  test('year filter works', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @year={{2023}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 1);
    assert.notOk(component.results[0].year.isPresent);
    assert.strictEqual(component.results[0].course.title, 'First Course');
    assert.verifySteps(['API called']);
  });

  test('filter by school', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(schools: [33]) { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by program', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programs: [13]) { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by school and program', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(schools: [24], programs: [13]) { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'program',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by program year', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programYears: [13]) { id, title, year, externalId, school { title } } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'program year',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('filter by mesh', async function (assert) {
    let graphQueryCounter = 0;
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      graphQueryCounter++;
      const { query } = JSON.parse(requestBody);
      let rhett;
      switch (graphQueryCounter) {
        case 1:
          assert.strictEqual(
            query,
            'query { meshDescriptors(id: "ABC") { courses { id }, courseObjectives { course { id } }, sessions { course { id } }, sessionObjectives { session { course { id } } } } }',
          );
          rhett = {
            data: {
              meshDescriptors: [
                {
                  courses: [{ id: 1 }, { id: 3 }, { id: 5 }, { id: 1 }],
                  courseObjectives: [{ course: { id: 2 } }],
                  sessions: [{ course: { id: 4 } }, { course: { id: 3 } }],
                  sessionObjectives: [{ session: { course: { id: 6 } } }],
                },
              ],
            },
          };
          break;
        case 2:
          assert.strictEqual(
            query,
            'query { courses(ids: [1, 2, 3, 4, 5, 6]) { id, title, year, externalId, school { title } } }',
          );
          rhett = responseData;
          break;
      }

      return rhett;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'mesh term',
      prepositionalObjectTableRowId: 'ABC',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
    assert.verifySteps(['API called', 'API called']);
  });

  test('filter by academic year', async function (assert) {
    this.server.post('api/graphql', function (schema, { requestBody }) {
      assert.step('API called');
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(academicYears: [2015]) { id, title, year, externalId, school { title } } }',
      );
      return {
        data: {
          courses: [{ id: 1, title: 'First Course', year: 2015 }],
        },
      };
    });
    const { id } = this.server.create('report', {
      subject: 'course',
      prepositionalObject: 'academic year',
      prepositionalObjectTableRowId: '2015',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
    assert.verifySteps(['API called']);
  });

  test('download', async function (assert) {
    await setupAuthentication({}, true);
    this.server.post('api/graphql', () => {
      assert.step('API called');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'course',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    let capturedBlob = null;
    const downloadMockUrl = 'blob:mock-url';
    const downloadFilename = 'All Courses in All Schools.csv';

    // Override URL methods
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    URL.createObjectURL = (blob) => {
      assert.step('URL.createObjectURL called');
      capturedBlob = blob;
      assert.ok(blob instanceof Blob, 'Blob passed to createObjectURL');
      return downloadMockUrl;
    };
    URL.revokeObjectURL = (url) => {
      assert.step('URL.revokeObjectURL called');
      assert.strictEqual(url.href, downloadMockUrl, 'revokeObjectURL has correct href');
      assert.strictEqual(url.download, downloadFilename, 'revokeObjectURL has correct filename');
    };

    // Override document.body methods
    let appendedElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    document.body.appendChild = (el) => {
      assert.step('document.body.appendChild called');
      // stub out click() to avoid `Not allowed to load local resource: blob:mock-url` error
      el.click = () => {
        assert.step('el.click called');
      };
      appendedElement = el;
      assert.ok(el instanceof HTMLAnchorElement, 'Anchor element was appended');
    };
    document.body.removeChild = (el) => {
      assert.step('document.body.removeChild called');
      assert.strictEqual(el, appendedElement, 'Anchor element was removed');
    };

    await render(
      <template>
        <Course
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    await click('[data-test-button]');

    assert.strictEqual(appendedElement.href, downloadMockUrl, 'appended element has correct href');
    assert.strictEqual(
      appendedElement.download,
      downloadFilename,
      'appended element has correct filename',
    );

    const csvText = await capturedBlob.text();
    assert.strictEqual(
      csvText.trim(),
      'School,Academic Year,Course,Course ID\r\nFirst School,2023,First Course,\r\nSecond School,2020,Second Course,ext ID 1',
      'CSV content is correct',
    );

    // Restore original methods
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
    assert.verifySteps([
      'API called',
      'API called',
      'URL.createObjectURL called',
      'document.body.appendChild called',
      'el.click called',
      'document.body.removeChild called',
      'URL.revokeObjectURL called',
    ]);
  });
});
