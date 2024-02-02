/**
 * Mostly copied from https://github.com/Ticketfly/ember-mockdate-shim/blob/bb0204c24b4902c65dbcf192ccbc8f008f1f581b/addon/index.js
 */
import { set, reset } from 'mockdate';
import { _backburner } from '@ember/runloop';
import { trySet } from '@ember/object';

const originalDate = Date;
const originalPlatformNow = _backburner._platform.now;

/*
 * The backburner.js _platform.now function must be overridden when using this
 * addon in acceptance tests that return async model hooks. Otherwise the ember
 * run loop gets itself into an infinite loop as time will never progress.
 *
 * See this backburner PR for more info:
 * https://github.com/BackburnerJS/backburner.js/pull/264
 */
const freezeDateAt = (...args) => {
  trySet(_backburner, '_platform.now', originalDate.now);
  set(args);
};

const unfreezeDate = (...args) => {
  trySet(_backburner, '_platform.now', originalPlatformNow);
  reset(args);
};

export { freezeDateAt, unfreezeDate };
