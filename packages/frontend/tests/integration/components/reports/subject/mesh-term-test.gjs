import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/reports/subject/mesh-term';
import MeshTerm from 'frontend/components/reports/subject/mesh-term';

module('Integration | Component | reports/subject/mesh-term', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const responseData = {
    data: {
      meshDescriptors: [
        { id: 2, name: 'Second Term' },
        { id: 1, name: 'first Term' },
      ],
    },
  };

  test('it renders', async function (assert) {
    assert.expect(4);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors { name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2);
    assert.strictEqual(component.results[0].name, 'first Term');
    assert.strictEqual(component.results[1].name, 'Second Term');
  });

  test('it renders all results when resultsLengthMax is not reached', async function (assert) {
    assert.expect(3);

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors { name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(component.results.length, 2, 'responseData shows all 2 of 2 mesh terms');
    assert.notOk(component.hasFullResultsDownloadButton, 'full results download button is hidden');
  });

  test('it renders limited results and an extra download button when resultsLengthMax is eclipsed', async function (assert) {
    assert.expect(3);

    const responseDataLarge = {
      data: {
        meshDescriptors: [],
      },
    };

    for (let i = 0; i < 220; i++) {
      responseDataLarge.data.meshDescriptors.push({
        id: i,
        title: `mesh term ${i}`,
      });
    }

    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors { name } }');
      return responseDataLarge;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );

    assert.strictEqual(
      component.results.length,
      200,
      'responseDataLarge shows only 200 of 220 mesh terms',
    );
    assert.ok(component.hasFullResultsDownloadButton, 'full results download button is present');
  });

  test('filter by school', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors(schools: [33]) { name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      school: this.server.create('school', { id: 33 }),
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 33));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });

  test('filter by session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(query, 'query { meshDescriptors(sessions: [13]) { name } }');
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
  });

  test('filter by school and session', async function (assert) {
    assert.expect(1);
    this.server.post('api/graphql', function (schema, { requestBody }) {
      const { query } = JSON.parse(requestBody);
      assert.strictEqual(
        query,
        'query { meshDescriptors(schools: [24], sessions: [13]) { name } }',
      );
      return responseData;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      school: this.server.create('school', { id: 24 }),
      prepositionalObject: 'session',
      prepositionalObjectTableRowId: 13,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    this.set('school', await this.owner.lookup('service:store').findRecord('school', 24));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
          @school={{this.school}}
        />
      </template>,
    );
  });

  test('filter by course', async function (assert) {
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
            'query { courses(id: 11) { meshDescriptors { id }, learningMaterials { meshDescriptors { id } }, courseObjectives { meshDescriptors { id } }, sessions { meshDescriptors { id }, sessionObjectives { meshDescriptors { id } }, learningMaterials { meshDescriptors { id } }} } }',
          );
          rhett = {
            data: {
              courses: [
                {
                  meshDescriptors: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
                  courseObjectives: [
                    { meshDescriptors: [{ id: 'd' }] },
                    { meshDescriptors: [{ id: 'b' }] },
                  ],
                  learningMaterials: [
                    { meshDescriptors: [{ id: 'e' }] },
                    { meshDescriptors: [{ id: 'c' }] },
                  ],
                  sessions: [
                    {
                      meshDescriptors: [{ id: 'f' }, { id: 'g' }, { id: 'b' }],
                      sessionObjectives: [
                        { meshDescriptors: [{ id: 'h' }] },
                        { meshDescriptors: [{ id: 'e' }] },
                      ],
                      learningMaterials: [
                        { meshDescriptors: [{ id: 'i' }] },
                        { meshDescriptors: [{ id: 'c' }] },
                      ],
                    },
                    {
                      meshDescriptors: [{ id: 'j' }, { id: 'i' }, { id: 'k' }],
                      sessionObjectives: [
                        { meshDescriptors: [{ id: 'l' }] },
                        { meshDescriptors: [{ id: 'd' }] },
                      ],
                      learningMaterials: [
                        { meshDescriptors: [{ id: 'f' }] },
                        { meshDescriptors: [{ id: 'm' }] },
                      ],
                    },
                  ],
                },
              ],
            },
          };
          break;
        case 2:
          assert.strictEqual(
            query,
            'query { meshDescriptors(ids: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m"]) { name } }',
          );
          rhett = responseData;
          break;
        default:
          assert.ok(false, 'too many queries');
      }

      return rhett;
    });
    const { id } = this.server.create('report', {
      subject: 'mesh term',
      prepositionalObject: 'course',
      prepositionalObjectTableRowId: 11,
    });
    this.set('report', await this.owner.lookup('service:store').findRecord('report', id));
    await render(
      <template>
        <MeshTerm
          @subject={{this.report.subject}}
          @prepositionalObject={{this.report.prepositionalObject}}
          @prepositionalObjectTableRowId={{this.report.prepositionalObjectTableRowId}}
        />
      </template>,
    );
  });
});
