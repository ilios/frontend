import BaseStore, { CacheHandler } from '@ember-data/store';
import JSONAPICache from '@ember-data/json-api';
import {
  adapterFor,
  LegacyNetworkHandler,
  normalize,
  pushPayload,
  serializeRecord,
  serializerFor,
} from '@ember-data/legacy-compat';
import { buildSchema, instantiateRecord, modelFor, teardownRecord } from '@ember-data/model/hooks';
import RequestManager from '@ember-data/request';
import Fetch from '@ember-data/request/fetch';
import { singularize } from 'ember-inflector';
import { getOwner } from '@ember/owner';
import { service } from '@ember/service';

function normalizeResource(store, resource) {
  resource.type = singularize(resource.type);

  if (resource.relationships) {
    Object.keys(resource.relationships).forEach(relationship => {
      const rel = resource.relationships[relationship];
      if (rel.data) {
        if (Array.isArray(rel.data)) {
          rel.data.forEach(data => {
            data.type = singularize(data.type);
          });
        } else {
          rel.data.type = singularize(rel.data.type);
        }
      }
    });
  }

  if (resource.attributes) {
    const { attributes } = resource;
  	const fields = store.schema.fields(resource);
    const owner = getOwner(store);
		Object.entries(attributes).forEach(([key, value]) => {
			const attrSchema = fields.get(key);
			// TODO we want to enforce this but need to fix a bunch of test mocks to do so.
			// assert(`Expected to have a field schema for ${key} on ${resource.type}`, attrSchema);
			// assert(
			// 	`Expected field schema for ${key} on ${resource.type} to be of kind 'attribute', got ${attrSchema?.kind}`,
			// 	attrSchema?.kind === 'attribute',
			// );
			if (attrSchema?.kind === 'attribute' && attrSchema?.type) {
				// do transform
				// SAFETY: `lookup` type isn't robust enough, but this should be safe
				const transform = owner.lookup(`transform:${attrSchema.type}`);
				// SAFETY: in theory all transforms are supposed to return primitive Value types
				// but we can't enforce that in the type system, and also we know this is a "lie" because
				// the `date` transform (and a few others) currently pollute the cache with stateful values.
				attributes[key] = transform?.deserialize(value, attrSchema.options ?? {});
			}
		});
  }
}

class NormalizeHandler {
  constructor(session) {
    this.session = session;
  }

  async request(context, next) {
    const store = context.request.store;
    let request = context.request;

    const { jwt } = this.session.data.authenticated;
    if (jwt) {
      const headers = new Headers(request.headers);
      headers.set('X-JWT-Authorization', `Token ${jwt}`);
      request = Object.assign({}, request, { headers, mode: "cors", });
    }

    const result = await next(request);

    if (result) {
      if (result.data) {
        if (Array.isArray(result.data)) {
          result.data.forEach(v => normalizeResource(store, v));
        } else {
          normalizeResource(store, result.data);
        }
      }

      if (Array.isArray(result.included)) {
        result.included.forEach((v) => normalizeResource(store, v));
      }
    }
  }
};

export default class StoreService extends BaseStore {
  @service session;

  adapterFor = adapterFor;
  serializerFor = serializerFor;
  pushPayload = pushPayload;
  normalize = normalize;
  serializeRecord = serializeRecord;

  constructor() {
    super(...arguments);
    this.requestManager = new RequestManager();
    this.requestManager.use([LegacyNetworkHandler, new NormalizeHandler(this.session), Fetch]);
    this.requestManager.useCache(CacheHandler);
  }

  createSchemaService() {
    return buildSchema(this);
  }

  createCache(storeWrapper) {
    return new JSONAPICache(storeWrapper);
  }

  instantiateRecord(identifier, createRecordArgs) {
    return instantiateRecord.call(this, identifier, createRecordArgs);
  }

  teardownRecord(record) {
    teardownRecord.call(this, record);
  }

  modelFor(type) {
    return modelFor.call(this, type) || super.modelFor(type);
  }
}
