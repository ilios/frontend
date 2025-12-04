import { http, HttpResponse } from 'msw';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { db } from '../db.js';
import { formatJsonApi } from '../utils/json-api-formatter.js';
import { parseQueryParams } from '../utils/query-parser.js';

// Create generic CRUD handlers for a model
export function createCrudHandlers(modelName, apiRoute) {
  const pluralName = pluralize(modelName);
  const apiPath = apiRoute || pluralName;

  return [
    // GET collection
    http.get(`/api/${apiPath}`, ({ request }) => {
      const url = new URL(request.url);
      const { filterParams, limit, offset, queryTerms } = parseQueryParams(url.searchParams);

      let records = db[modelName].getAll();

      // Apply filters
      if (filterParams.length > 0) {
        records = records.filter((record) => {
          return filterParams.every(({ param, value }) => {
            const fieldValue = record[camelize(param)];
            if (Array.isArray(value)) {
              return value.includes(String(fieldValue));
            }
            return String(fieldValue) === String(value);
          });
        });
      }

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

      return HttpResponse.json(formatJsonApi(paginatedRecords, modelName, { meta }));
    }),

    // GET single record
    http.get(`/api/${apiPath}/:id`, ({ params }) => {
      const record = db[modelName].findFirst({
        where: { id: { equals: params.id } },
      });

      if (!record) {
        return new HttpResponse(null, { status: 404 });
      }

      return HttpResponse.json(formatJsonApi(record, modelName));
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

      // Extract relationships
      if (data.relationships) {
        Object.keys(data.relationships).forEach((key) => {
          const relationship = data.relationships[key];
          if (relationship.data) {
            if (Array.isArray(relationship.data)) {
              attrs[key] = relationship.data.map((item) => item.id);
            } else {
              attrs[key] = relationship.data.id;
            }
          }
        });
      }

      const record = db[modelName].create(attrs);

      return HttpResponse.json(formatJsonApi(record, modelName), { status: 201 });
    }),

    // PATCH update record
    http.patch(`/api/${apiPath}/:id`, async ({ params, request }) => {
      const body = await request.json();
      const data = body.data;

      if (!data) {
        return new HttpResponse(JSON.stringify({ errors: ['Invalid request body'] }), {
          status: 400,
        });
      }

      const record = db[modelName].findFirst({
        where: { id: { equals: params.id } },
      });

      if (!record) {
        return new HttpResponse(null, { status: 404 });
      }

      // Extract attributes to update
      const attrs = { ...data.attributes };

      // Extract relationships to update
      if (data.relationships) {
        Object.keys(data.relationships).forEach((key) => {
          const relationship = data.relationships[key];
          if (relationship.data !== undefined) {
            if (Array.isArray(relationship.data)) {
              attrs[key] = relationship.data.map((item) => item.id);
            } else {
              attrs[key] = relationship.data ? relationship.data.id : null;
            }
          }
        });
      }

      db[modelName].update({
        where: { id: { equals: params.id } },
        data: attrs,
      });

      const updated = db[modelName].findFirst({
        where: { id: { equals: params.id } },
      });

      return HttpResponse.json(formatJsonApi(updated, modelName));
    }),

    // DELETE record
    http.delete(`/api/${apiPath}/:id`, ({ params }) => {
      const record = db[modelName].findFirst({
        where: { id: { equals: params.id } },
      });

      if (!record) {
        return new HttpResponse(null, { status: 404 });
      }

      db[modelName].delete({
        where: { id: { equals: params.id } },
      });

      return new HttpResponse(null, { status: 204 });
    }),
  ];
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
