class IdentityManager {
  #usedIds = [];
  #nextId = 1;
  #returnIdAsString;
  constructor(returnIdAsString) {
    this.#returnIdAsString = returnIdAsString;
  }

  getNextId() {
    while (this.#usedIds.includes(this.#nextId)) {
      this.#nextId++;
    }

    this.#usedIds.push(this.#nextId);

    return this.#returnIdAsString ? String(this.#nextId) : this.#nextId;
  }

  /**
    Resets the identity manager, marking all unique identifiers as available.
  */
  reset() {
    this.#nextId = 1;
    this.#usedIds = [];
  }
}

export { IdentityManager };
