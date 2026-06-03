import { authenticateSession } from 'ember-simple-auth/test-support';
import { getContext } from '@ember/test-helpers';

const defaultUserId = 100;

export default async function (
  userObject = { id: defaultUserId },
  performsNonLearnerFunction = false,
  jwtOptions = {},
) {
  const userId = userObject && 'id' in userObject ? userObject.id : defaultUserId;
  let jwtObject = {
    user_id: userId,
  };
  const nonLearnerFunctions = [
    'directedCourses',
    'administeredCourses',
    'administeredSessions',
    'instructorGroups',
    'instructedOfferings',
    'instructorIlmSessions',
    'instructedLearnerGroups',
    'directedPrograms',
    'programYears',
    'administeredCurriculumInventoryReports',
    'directedSchools',
    'administeredSchools',
  ];
  const hasNonLearnerFunctionInPassedData = nonLearnerFunctions.some((key) => {
    return key in userObject && Array.isArray(userObject[key]) && userObject[key].length > 0;
  });
  if (performsNonLearnerFunction || hasNonLearnerFunctionInPassedData) {
    jwtObject['performs_non_learner_function'] = true;
  }
  // KLUDGE!
  // merge options into JWT.
  // this is quite bad, since this has the potential to clobber previously set values.
  // alas, rewriting the whole thing is not in scope, so let's cheese it like this for now.
  // TODO: clean this up [ST 2026/06/03]
  jwtObject = { ...jwtObject, ...jwtOptions };

  const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
  const token = {
    jwt: encodedData,
  };
  const { server } = getContext();
  await authenticateSession(token);

  if (userObject) {
    const properties = Object.assign({ id: userId }, userObject);
    const user = await server.create('user', properties);
    await server.create('authentication', { id: user.id, user });
    return user;
  }

  return null;
}
