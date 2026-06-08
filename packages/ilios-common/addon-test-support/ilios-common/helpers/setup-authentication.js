import { authenticateSession } from 'ember-simple-auth/test-support';
import { getContext } from '@ember/test-helpers';
import jwtEncode from './jwt-encode';

const defaultUserId = 100;

/**
 * Creates an authenticated user session.
 * In the process, this will create a new user and its credentials in the mock backend.
 * That new mock user will be "logged in" and returned.
 *
 * @param {object} userObject The user attributes, such as id and relationships, for the user to be created/authenticated.
 * @param {object} jwtOptions Attributes to encode in the user session's JWT, for example audience ("aud") values.
 * @returns {Promise<object>} A promise resolving to the mock user model that was created and authenticated in the process.
 */
export default async function (userObject = { id: defaultUserId }, jwtOptions = {}) {
  // Establish user identity, throw an error if that fails.
  const userId = userObject && 'id' in userObject ? userObject.id : defaultUserId;
  if (!userId) {
    throw new Error('Invalid or missing user id');
  }

  // Figure out if the given user performs non-learner functions in the application.
  // This information will be encoded in the JWT and later referenced during permission checks
  // for the "current user" during test runs.
  // Check the user's "root" flag and any relevant relationships that were passed in.
  // This mirrors the `App\Classes\SessionUser::performsNonLearnerFunction()` in the Ilios backend,
  // please check there for further reference.
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
  const performsNonLearnerFunction =
    userObject.root ||
    nonLearnerFunctions.some((key) => {
      return key in userObject && Array.isArray(userObject[key]) && userObject[key].length > 0;
    });

  // Create a user record with companion authn record in the mock backend.
  const { server } = getContext();
  const properties = Object.assign({ id: userId }, userObject);
  const user = await server.create('user', properties);
  await server.create('authentication', { id: user.id, user });

  // Merge given JWT options with the given user's identity and calculated permissions flag.
  const jwtObject = {
    ...jwtOptions,
    ...{ user_id: userId, performs_non_learner_function: performsNonLearnerFunction },
  };
  // Encode the JWT and create an authenticated user session with it.
  const token = {
    jwt: jwtEncode(jwtObject),
  };
  await authenticateSession(token);

  // Finally, return the created user record from the mock backend.
  return user;
}
