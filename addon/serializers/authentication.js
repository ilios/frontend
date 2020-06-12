import IliosSerializer from './ilios';

export default class AuthenticationSerializer extends IliosSerializer {
  // primaryKey = 'user';
  serialize(snapshot, options) {
    const json = super.serialize(snapshot, options);

    //don't persist empty passwords
    if (!json.data.attributes.password) {
      delete json.password;
    }

    //don't persist empty usernames
    if (!json.data.attributes.username) {
      delete json.username;
    }

    return json;
  }
}
