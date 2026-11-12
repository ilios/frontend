import { genericHandlers } from './generic-crud';
import getApplicationConfig from './get-application-config';
import getAuthLogout from './get-auth-logout';
import getAuthToken from './get-auth-token';
import getAuthWhoami from './get-auth-whoami';
import getCohorts from './get-cohorts';
import getCourses from './get-courses';
import getErrors from './get-errors';
import getPendingUserUpdates from './get-pending-user-updates';
import getSchoolEvents from './get-school-events';
import getSessions from './get-sessions';
import getUserEvents from './get-user-events';
import getUserPreferences from './get-user-preferences';
import postAuthLogin from './post-auth-login';
import postProgramYear from './post-program-year';
import postReports from './post-reports';
import postUpload from './post-upload';

export function getHandlers(config) {
  return [
    postAuthLogin,
    getAuthLogout,
    getAuthWhoami,
    getAuthToken,
    getErrors,
    getApplicationConfig(config),
    getUserPreferences,
    getCohorts,
    getCourses,
    getPendingUserUpdates,
    getSchoolEvents,
    getSessions,
    getUserEvents,
    postProgramYear,
    postReports,
    postUpload,
    ...genericHandlers,
  ];
}
