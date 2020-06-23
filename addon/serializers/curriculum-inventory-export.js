import IliosSerializer from './ilios';

export default class CurriculumInventoryExportSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);

    //don't persist this, it is handled by the server
    delete json.data.attributes.createdAt;
    delete json.data.attributes.createdBy;
    delete json.data.attributes.document;
    return json;
  }
}
