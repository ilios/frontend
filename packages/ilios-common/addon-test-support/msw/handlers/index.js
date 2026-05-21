import postAuthLogin from './post-auth-login';
import getAuthLogout from './get-auth-logout';
import getAuthWhoami from './get-auth-whoami';
import getAuthToken from './get-auth-token';
import getApplicationConfig from './get-application-config';
import getErrors from './get-errors';

import getCohorts from './get-cohorts';
import getCourses from './get-courses';
import getPendingUserUpdates from './get-pending-user-updates';
import getSchoolEvents from './get-school-events';
import getSessions from './get-sessions';
import getUserEvents from './get-user-events';
import postProgramYear from './post-program-year';
import postReports from './post-reports';
import postUpload from './post-upload';

import { genericHandlers } from './generic-crud';

export function getHandlers(config) {
  return [
    postAuthLogin,
    getAuthLogout,
    getAuthWhoami,
    getAuthToken,
    getErrors,
    getApplicationConfig(config),
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
