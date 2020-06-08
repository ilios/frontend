import IliosSerializer from './ilios';

export default class CurriculumInventoryExportSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);

    //don't persist this, it is handled by the server
    delete json.createdAt;
    delete json.createdBy;
    delete json.document;
    return json;
  }
}
