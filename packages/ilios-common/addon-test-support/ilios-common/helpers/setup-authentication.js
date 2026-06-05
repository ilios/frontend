import { authenticateSession } from 'ember-simple-auth/test-support';
import { getContext } from '@ember/test-helpers';

const defaultUserId = 100;

/**
 * Creates an authenticated user session.
 *
 * @param {object} userObject Carries the id and model relationships of a given user.
 * @param {boolean} performsNonLearnerFunction Overrides the value calculated based on given user relationships, if provided.
 * @returns {Promise<object>} A promise resolving to the mock user model that was created for the given user in the process.
 */
export default async function (
  userObject = { id: defaultUserId },
  performsNonLearnerFunction = false,
) {
  // establish user identity.
  const userId = userObject && 'id' in userObject ? userObject.id : defaultUserId;

  // this will fire if user identity cannot be established.
  // which can only be achieved by the given user object carries a falsy 'id' value.
  // so don't do dumb stuff like passing `{ id: 0 }` as the first arg.
  if (!userId) {
    throw new Error('Invalid or missing user id');
  }

  const jwtObject = {
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
  const encodedData = window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
  const token = {
    jwt: encodedData,
  };
  const { server } = getContext();
  await authenticateSession(token);

  const properties = Object.assign({ id: userId }, userObject);
  const user = await server.create('user', properties);
  await server.create('authentication', { id: user.id, user });
  return user;
}
