import Cookie from 'ember-simple-auth/session-stores/cookie';

export default class ApplicationSessionStore extends Cookie {
  cookieName = 'ilios-session';
  sameSite = 'Strict';
}
