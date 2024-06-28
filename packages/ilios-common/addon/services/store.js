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

export default class StoreService extends BaseStore {
  adapterFor = adapterFor;
  serializerFor = serializerFor;
  pushPayload = pushPayload;
  normalize = normalize;
  serializeRecord = serializeRecord;

  constructor() {
    super(...arguments);
    this.requestManager = new RequestManager();
    this.requestManager = new RequestManager();
    this.requestManager.use([LegacyNetworkHandler, Fetch]);
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
