import IliosSerializer from './ilios';
import { get } from '@ember/object';

export default class LearningMaterialSerializer extends IliosSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    //When POSTing new file learningMaterials we need to include the file hash
    const fileHash = get(snapshot.record, 'fileHash');
    if (fileHash) {
      json.data.attributes.fileHash = fileHash;
    }

    //don't persist this, it is handled by the server
    delete json.data.attributes.absoluteFileUri;
    delete json.data.attributes.uploadDate;

    return json;
  }
}
