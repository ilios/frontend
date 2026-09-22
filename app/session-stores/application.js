import BaseStore from 'ember-simple-auth/session-stores/base';
import CookieStore from 'ember-simple-auth/session-stores/cookie';
import EphemeralStore from 'ember-simple-auth/session-stores/ephemeral';
import { assert } from '@ember/debug';

/**
 * Custom Ember Simple Auth Store
 * In order to support the different authentication requirements of our LTI and regular
 * frontend this store dynamically chooses between our cookie store and an ephermeral
 * store that keeps no data.
 * Ref: https://github.com/mainmatter/ember-simple-auth#implementing-a-custom-store
 */
export default class ApplicationSessionStore extends BaseStore {
  #activeStore;

  constructor(owner) {
    super(owner);
    this.cookieStore = new IliosCookieStore(owner);
    this.ephemeralStore = new EphemeralStore(owner);
  }

  useTheEphemeralStore() {
    this.#activeStore = this.ephemeralStore;
  }

  useTheCookieStore() {
    this.#activeStore = this.cookieStore;
  }

  clear() {
    assert('active store must exist before calling clear', Boolean(this.#activeStore));
    return this.#activeStore.clear();
  }

  clearRedirectTarget() {
    assert(
      'active store must exist before calling clearRedirectTarget',
      Boolean(this.#activeStore),
    );
    return this.#activeStore.clearRedirectTarget();
  }

  getRedirectTarget() {
    assert('active store must exist before calling getRedirectTarget', Boolean(this.#activeStore));
    return this.#activeStore.getRedirectTarget();
  }

  restore() {
    assert('active store must exist before calling restore', Boolean(this.#activeStore));
    return this.#activeStore.restore();
  }

  setRedirectTarget(url) {
    assert('active store must exist before calling setRedirectTarget', Boolean(this.#activeStore));
    return this.#activeStore.setRedirectTarget(url);
  }

  persist(data) {
    assert('active store must exist before calling persist', Boolean(this.#activeStore));
    return this.#activeStore.persist(data);
  }
}

/**
 * Setup the attributes we want in our cookies
 */
class IliosCookieStore extends CookieStore {
  cookieName = 'ilios-session';
  sameSite = 'Strict';
}
