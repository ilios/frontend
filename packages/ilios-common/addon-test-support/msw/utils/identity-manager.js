/**
  Copied from MirageJs
  Original Code: https://github.com/miragejs/miragejs/blob/7ff4f3f6fe56bf0cb1648f5af3f5210fcb07e20b/lib/identity-manager.js
*/

function isNumber(n) {
  return (+n).toString() === n.toString();
}

class IdentityManager {
  constructor() {
    this._nextId = 1;
    this._ids = {};
  }

  /**
    @method get
  */
  #get() {
    return this._nextId;
  }

  /**
    Registers `uniqueIdentifier` as used.

    This method should throw is `uniqueIdentifier` has already been taken.

    @param {String|Number} uniqueIdentifier
  */
  set(uniqueIdentifier) {
    if (this._ids[uniqueIdentifier]) {
      throw new Error(`Attempting to use the ID ${uniqueIdentifier}, but it's already been used`);
    }

    if (isNumber(uniqueIdentifier) && +uniqueIdentifier >= this._nextId) {
      this._nextId = +uniqueIdentifier + 1;
    }

    this._ids[uniqueIdentifier] = true;
  }

  /**
   * Increment ID
   */
  inc() {
    let nextValue = this.#get();

    this._nextId = nextValue + 1;

    return nextValue;
  }

  /**
    Returns the next unique identifier.
  */
  fetch() {
    let id = this.#get();

    this._ids[id] = true;

    this.inc();

    return id;
  }

  /**
    Resets the identity manager, marking all unique identifiers as available.
  */
  reset() {
    this._nextId = 1;
    this._ids = {};
  }
}

export { IdentityManager };
