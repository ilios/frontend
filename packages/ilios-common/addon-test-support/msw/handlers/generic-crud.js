import { http, HttpResponse } from 'msw';
import { singularize, pluralize } from 'ember-inflector';
import {
  db,
  getRelatedRecord,
  validateRecordData,
  modelsWithStringIds,
  filterByParams,
} from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';
import { getIdentityManager } from '../utils/identity-managers.js';

// Create generic CRUD handlers for a model
export function createCrudHandlers(modelName, apiRoute) {
  const pluralName = pluralize(modelName);
  const apiPath = apiRoute || pluralName;

  return [
    // GET collection
    http.get(`/api/${apiPath}`, async ({ request }) => {
      const url = new URL(request.url);
      const { filterParams, limit, offset, queryTerms, include } = parseQueryParams(
        url.searchParams.toString(),
      );
      let records = await db[modelName].all();
      records = await filterByParams(modelName, records, filterParams);

      // Apply search if query terms exist
      if (queryTerms.length > 0) {
        const searchTerm = queryTerms.join(' ').toLowerCase();
        records = records.filter((record) => {
          return Object.values(record).some((value) => {
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTerm);
            }
            return false;
          });
        });
      }

      // Apply pagination
      const total = records.length;
      const paginatedRecords = records.slice(offset, offset + limit);

      const meta = {
        totalCount: total,
      };

      return HttpResponse.json(formatJsonApi(paginatedRecords, modelName, { meta, include }));
    }),

    // GET single record
    http.get(`/api/${apiPath}/:id`, async ({ request, params }) => {
      const id = modelsWithStringIds.has(modelName) ? params.id : Number(params.id);
      const url = new URL(request.url);
      const { include } = parseQueryParams(url.searchParams.toString());
      const record = await db[modelName].findFirst((q) => q.where({ id }));

      if (!record) {
        return new HttpResponse(`No ${modelName} for id: ${params.id}`, { status: 404 });
      }

      return HttpResponse.json(formatJsonApi(record, modelName, { include }));
    }),

    // POST new record
    http.post(`/api/${apiPath}`, async ({ request }) => {
      const body = await request.json();
      const data = body.data;

      if (!data) {
        return new HttpResponse(JSON.stringify({ errors: ['Invalid request body'] }), {
          status: 400,
        });
      }

      // Extract attributes
      const attrs = { ...data.attributes };

      if (!attrs.id) {
        // Auto-generate an ID if it doesn't exist yet.
        // TODO: consider throwing an error here since POST should be used to update given records [ST 2026/05/11]
        attrs.id = getIdentityManager(modelName).inc();
      }
      await extractRelationshipsInUpdate(modelName, data, attrs);

      validateRecordData(modelName, attrs);

      const record = await db[modelName].create(attrs);

      return HttpResponse.json(formatJsonApi(record, modelName), { status: 201 });
    }),

    // PATCH update record
    http.patch(`/api/${apiPath}/:id`, async ({ params, request }) => {
      const body = await request.json();
      const data = body.data;
      const id = modelsWithStringIds.has(modelName) ? params.id : Number(params.id);

      const existingRecord = await db[modelName].findFirst((q) => q.where({ id }));
      if (!existingRecord) {
        return new HttpResponse(null, { status: 404 });
      }
      const { data: jsonApiData } = formatJsonApi(existingRecord, modelName);

      //delete the existing existingRecord and create a brand new one.
      //This is a HACK, couldn't get the relationships to update otherwise
      await db[modelName].delete(existingRecord);

      if (!data.attributes) {
        return new HttpResponse(JSON.stringify({ errors: ['Invalid request body'] }), {
          status: 400,
        });
      }

      // Extract attributes
      const attrs = { ...data.attributes };
      attrs.id = id;

      await extractRelationshipsInUpdate(modelName, data, attrs);
      //add current values for any attributes the patch did not set
      Object.keys(jsonApiData.attributes).forEach((key) => {
        if (!(key in attrs)) {
          attrs[key] = jsonApiData.attributes[key];
        }
      });

      const keys = Object.keys(jsonApiData.relationships);

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!(key in attrs)) {
          const value = jsonApiData.relationships[key].data;
          if (Array.isArray(value)) {
            const records = await Promise.all(
              value.map(({ id, type }) => {
                const singularType = singularize(type);
                id = modelsWithStringIds.has(singularType) ? id : Number(id);
                return db[singularType].findFirst((q) => q.where({ id }));
              }),
            );
            attrs[key] = records;
          } else {
            const singularType = singularize(value.type);
            let id = modelsWithStringIds.has(singularType) ? value.id : Number(value.id);
            const record = await db[singularType].findFirst((q) => q.where({ id }));
            attrs[key] = record;
          }
        }
      }

      validateRecordData(modelName, attrs);
      const newRecord = await db[modelName].create(attrs);

      return HttpResponse.json(formatJsonApi(newRecord, modelName));
    }),

    // DELETE record
    http.delete(`/api/${apiPath}/:id`, async ({ params }) => {
      const id = modelsWithStringIds.has(modelName) ? params.id : Number(params.id);
      const record = await db[modelName].findFirst((q) => q.where({ id }));

      if (!record) {
        return new HttpResponse(null, { status: 404 });
      }

      await db[modelName].delete(record);

      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

async function extractRelationshipsInUpdate(modelName, data, attrs) {
  if (data.relationships) {
    const keys = Object.keys(data.relationships);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const relationship = data.relationships[key];

      if (Array.isArray(relationship.data)) {
        attrs[key] = await Promise.all(
          relationship.data.map((item) => {
            const relatedModelName = singularize(item.type);
            const id = modelsWithStringIds.has(relatedModelName) ? item.id : Number(item.id);
            return getRelatedRecord(modelName, key, id);
          }),
        );
      } else {
        if (relationship.data) {
          const relatedModelName = singularize(relationship.data.type);
          const id = modelsWithStringIds.has(relatedModelName)
            ? relationship.data.id
            : Number(relationship.data.id);
          attrs[key] = relationship.data ? await getRelatedRecord(modelName, key, id) : null;
        } else {
          attrs[key] = undefined;
        }
      }
    }
  }
}

// Generate handlers for all standard models
const modelConfigs = [
  { model: 'aamcMethod', route: 'aamcmethods' },
  { model: 'aamcPcrs', route: 'aamcpcrses' },
  { model: 'academicYear', route: 'academicyears' },
  { model: 'assessmentOption', route: 'assessmentoptions' },
  { model: 'authentication', route: 'authentications' },
  { model: 'cohort', route: 'cohorts' },
  { model: 'competency', route: 'competencies' },
  { model: 'course', route: 'courses' },
  { model: 'courseClerkshipType', route: 'courseclerkshiptypes' },
  { model: 'courseLearningMaterial', route: 'courselearningmaterials' },
  { model: 'courseObjective', route: 'courseobjectives' },
  { model: 'curriculumInventoryAcademicLevel', route: 'curriculuminventoryacademiclevels' },
  { model: 'curriculumInventoryExport', route: 'curriculuminventoryexports' },
  { model: 'curriculumInventoryInstitution', route: 'curriculuminventoryinstitutions' },
  { model: 'curriculumInventoryReport', route: 'curriculuminventoryreports' },
  { model: 'curriculumInventorySequence', route: 'curriculuminventorysequences' },
  { model: 'curriculumInventorySequenceBlock', route: 'curriculuminventorysequenceblocks' },
  { model: 'ilmSession', route: 'ilmsessions' },
  { model: 'instructorGroup', route: 'instructorgroups' },
  { model: 'learnerGroup', route: 'learnergroups' },
  { model: 'learningMaterial', route: 'learningmaterials' },
  { model: 'learningMaterialStatus', route: 'learningmaterialstatuses' },
  { model: 'learningMaterialUserRole', route: 'learningmaterialuserroles' },
  { model: 'meshConcept', route: 'meshconcepts' },
  { model: 'meshDescriptor', route: 'meshdescriptors' },
  { model: 'meshPreviousIndexing', route: 'meshpreviousindexings' },
  { model: 'meshQualifier', route: 'meshqualifiers' },
  { model: 'meshTree', route: 'meshtrees' },
  { model: 'objective', route: 'objectives' },
  { model: 'offering', route: 'offerings' },
  { model: 'pendingUserUpdate', route: 'pendinguserupdates' },
  { model: 'program', route: 'programs' },
  { model: 'programYear', route: 'programyears' },
  { model: 'programYearObjective', route: 'programyearobjectives' },
  { model: 'report', route: 'reports' },
  { model: 'school', route: 'schools' },
  { model: 'schoolConfig', route: 'schoolconfigs' },
  { model: 'session', route: 'sessions' },
  { model: 'sessionDescription', route: 'sessiondescriptions' },
  { model: 'sessionLearningMaterial', route: 'sessionlearningmaterials' },
  { model: 'sessionObjective', route: 'sessionobjectives' },
  { model: 'sessionType', route: 'sessiontypes' },
  { model: 'term', route: 'terms' },
  { model: 'user', route: 'users' },
  { model: 'userRole', route: 'userroles' },
  { model: 'userSessionMaterialStatus', route: 'usersessionmaterialstatuses' },
  { model: 'vocabulary', route: 'vocabularies' },
];

export const genericHandlers = modelConfigs.flatMap(({ model, route }) =>
  createCrudHandlers(model, route),
);
