import { authenticateSession } from '../helpers/ember-simple-auth';

export default function(application, userObject = {id: 4136}) {
  let encodedData =  window.btoa('') + '.' +  window.btoa('{"user_id": 4136}') + '.';
  let token = {
    jwt: encodedData
  };
  authenticateSession(application, token);

  if(userObject){
    server.create('authentication', {id: userObject.id, user: userObject.id})
    return server.create('user', userObject);
  }

  return null;
}
