import { authenticateSession } from 'ember-simple-auth/test-support';
import { getContext } from '@ember/test-helpers';

const defaultUserId = 100;

/**
 * Creates an authenticated user session.
 *
 * @param {object} userObject Carries the id and model relationships of a given user.
 * @param {boolean} performsNonLearnerFunction Overrides the value calculated based on given user relationships, if provided.
 * @returns {Promise<object|null>} A promise resolving to the mock user model that was created for the given user in the process.
 */
export default async function (
  userObject = { id: defaultUserId },
  performsNonLearnerFunction = false,
) {
  const userId = userObject && 'id' in userObject ? userObject.id : defaultUserId;
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

  if (userObject) {
    const properties = Object.assign({ id: userId }, userObject);
    const user = await server.create('user', properties);
    await server.create('authentication', { id: user.id, user });
    return user;
  }

  return null;
}
