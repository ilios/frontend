import { authenticateSession } from '../helpers/ember-simple-auth';

export default function(application, userObject = {id: 4136}) {
  let encodedData =  window.btoa('') + '.' +  window.btoa('{"user_id": 4136}') + '.';
  let token = {
    jwt: encodedData
  };
  authenticateSession(application, token);
  
  if(userObject){
    return server.create('user', userObject);
  }
  
  return null;
}
