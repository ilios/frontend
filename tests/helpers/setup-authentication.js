import { authenticateSession } from '../helpers/ember-simple-auth';

export default function(application, userObject = {id: 4136}) {
  let encodedData =  window.btoa('') + '.' +  window.btoa('{"user_id": 4136}') + '.';
  let token = {
    jwt: encodedData
  };
  authenticateSession(application, token);

  if(userObject){
    let user = server.create('user', userObject);
    server.create('authentication', {id: user.id, user});
    return user;
  }

  return null;
}
