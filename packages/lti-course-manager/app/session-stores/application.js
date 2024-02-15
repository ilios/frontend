import CookieStore from 'ember-simple-auth/session-stores/cookie';

export default class ApplicationSessionStore extends CookieStore {
  cookieName = 'ilios-lti-course-manager-session';
}
