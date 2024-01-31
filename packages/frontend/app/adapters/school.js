import IliosAdapter from 'ilios-common/adapters/ilios';

export default IliosAdapter.extend({
  /**
   * Don't reload school records if we have any of them
   * in the store already. Schools rarely change, but they
   * are needed all the time, we just don't need to go
   * back to the API once they are loaded.
   */
  shouldReloadAll(store, snapshotRecordArray) {
    return !snapshotRecordArray.length;
  },
  shouldBackgroundReloadAll() {
    return false;
  },
});
