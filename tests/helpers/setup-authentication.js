import { authenticateSession } from 'ember-simple-auth/test-support';
import { getContext } from '@ember/test-helpers';

const defaultUserId = 100;

export default async function(userObject = {id: defaultUserId}) {
  const userId = (userObject && 'id' in userObject) ? userObject.id : defaultUserId;
  let encodedData =  window.btoa('') + '.' +  window.btoa(`{"user_id": ${userId}}`) + '.';
  let token = {
    jwt: encodedData
  };
  let { server } = getContext();
  await authenticateSession(token);

  if (userObject) {
    const properties = Object.assign({id: userId}, userObject);
    let user = server.create('user', properties);
    server.create('authentication', {id: user.id, user});
    return user;
  }

  return null;
}
