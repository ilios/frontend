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
        { id: 1, title: 'First Course', year: 2023 },
        { id: 2, title: 'Second Course', year: 2020, externalId: 'ext ID 1' },
      ],
    },
  };

  test('it renders for user with permissions', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(10);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
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
    assert.ok(component.results[0].hasLink);
    assert.ok(component.results[1].hasLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
    assert.strictEqual(component.results[0].link, '/courses/2');
    assert.strictEqual(component.results[1].link, '/courses/1');
  });

  test('it renders for user with no permissions', async function (assert) {
    await setupAuthentication();
    assert.expect(8);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
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
    assert.notOk(component.results[0].hasLink);
    assert.notOk(component.results[1].hasLink);
    assert.strictEqual(component.results[0].year, '2020');
    assert.strictEqual(component.results[1].year, '2023');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
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
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(3);

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
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
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
  });

  test('it reads academic year config', async function (assert) {
    assert.expect(6);
    this.server.get('application/config', function () {
      return {
        config: {
          academicYearCrossesCalendarYearBoundaries: true,
        },
      };
    });
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
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
    assert.strictEqual(component.results[0].year, '2020 - 2021');
    assert.strictEqual(component.results[1].year, '2023 - 2024');
    assert.strictEqual(component.results[0].courseTitle, 'Second Course (ext ID 1)');
    assert.strictEqual(component.results[1].courseTitle, 'First Course');
  });

  test('year filter works', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses { id, title, year, externalId } }');
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
    assert.notOk(component.results[0].hasYear);
    assert.strictEqual(component.results[0].courseTitle, 'First Course');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { courses(schools: [33]) { id, title, year, externalId } }');
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
  });

  test('filter by program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programs: [13]) { id, title, year, externalId } }',
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
  });

  test('filter by school and program', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(schools: [24], programs: [13]) { id, title, year, externalId } }',
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
  });

  test('filter by program year', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(programYears: [13]) { id, title, year, externalId } }',
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
  });

  test('filter by mesh', async function (assert) {
    assert.expect(2);
    let graphQueryCounter = 0;
    this.server.post('api/graphql', function (schema, { requestBody }) {
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
            'query { courses(ids: [1, 2, 3, 4, 5, 6]) { id, title, year, externalId } }',
          );
          rhett = responseData;
          break;
        default:
          assert.ok(false, 'too many queries');
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
  });

  test('filter by academic year', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { courses(academicYears: [2015]) { id, title, year, externalId } }',
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
  });

  //skipped because I can't figure out how to test the download functionality
  test('download', async function (assert) {
    await setupAuthentication({}, true);
    assert.expect(9);
    this.server.post('api/graphql', () => responseData);
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
      capturedBlob = blob;
      assert.ok(blob instanceof Blob, 'Blob passed to createObjectURL');
      return downloadMockUrl;
    };
    URL.revokeObjectURL = (url) => {
      assert.strictEqual(url.href, downloadMockUrl, 'revokeObjectURL has correct href');
      assert.strictEqual(url.download, downloadFilename, 'revokeObjectURL has correct filename');
    };

    // Override document.body methods
    let appendedElement;
    const originalAppendChild = document.body.appendChild;
    const originalRemoveChild = document.body.removeChild;
    document.body.appendChild = (el) => {
      // stub out click() to avoid `Not allowed to load local resource: blob:mock-url` error
      el.click = () => {
        assert.ok(true, 'Anchor click stubbed to prevent navigation');
      };
      appendedElement = el;
      assert.ok(el instanceof HTMLAnchorElement, 'Anchor element was appended');
    };
    document.body.removeChild = (el) => {
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
      'Course,Academic Year,Course ID\r\nSecond Course,2020,ext ID 1\r\nFirst Course,2023,',
      'CSV content is correct',
    );

    // Restore original methods
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });
});
