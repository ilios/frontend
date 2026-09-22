import ApplicationSerializer from './application';

export default class SessionSerializer extends ApplicationSerializer {
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);
    //don't persist this, it is handled by the server
    delete json.data.attributes.updatedAt;

    return json;
  }
}
