import { http, HttpResponse } from 'msw';
import { settled } from '@ember/test-helpers';
import { startMSW } from './start-msw.js';
import { db } from './db.js';
import { createModel, createModelList, resetIdCounter } from './create-model.js';
import { updateModel } from './update-model.js';

// Drop-in replacement for setupMirage() that maintains the same API
export function setupMSW(hooks) {
  hooks.beforeEach(async function () {
    if (!this.owner) {
      throw new Error(
        'Must call one of the ember-qunit setupTest() / setupRenderingTest() / setupApplicationTest() first',
      );
    }

    resetIdCounter();

    // Get ENV from the owner to pass apiVersion
    const ENV = this.owner.resolveRegistration('config:environment');
    const { apiVersion } = ENV;

    this.server = await startMSW({ apiVersion });

    // Provide Mirage-compatible API
    this.server.create = createModel;
    this.server.createList = createModelList;
    this.server.update = updateModel;
    this.server.db = db;
    this.server.get = get.bind(this);
    this.server.post = post.bind(this);
  });

  hooks.afterEach(async function () {
    await settled();

    //remove all records in the database
    await Promise.all(
      Object.keys(db).map(async (modelName) => {
        const collection = db[modelName];
        return await collection.deleteMany();
      }),
    );
    resetIdCounter();
  });
}

function get(url, callback) {
  this.server.use(
    http.get(
      url,
      async (request) => {
        const rhett = await callback(request);
        return HttpResponse.json(rhett);
      },
      { once: true },
    ),
  );
}

function post(url, callback) {
  this.server.use(
    http.post(
      url,
      async (request) => {
        const rhett = await callback(request);
        return HttpResponse.json(rhett);
      },
      { once: true },
    ),
  );
}
