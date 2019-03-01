import { isEmpty } from '@ember/utils';
import DS from 'ember-data';

const { RESTSerializer } = DS;

export default RESTSerializer.extend({
  isNewSerializerAPI: true,
  primaryKey: 'user',
  serialize(snapshot, options) {
    var json = this._super(snapshot, options);

    //don't persist empty passwords
    if (isEmpty(json.password)) {
      delete json.password;
    }

    //don't persist empty usernames
    if (isEmpty(json.username)) {
      delete json.username;
    }

    return json;
  }
});
