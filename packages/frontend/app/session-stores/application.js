import CookieStore from 'ember-simple-auth/session-stores/cookie';

export default CookieStore.extend({
  cookieName: 'ilios-session',
});
