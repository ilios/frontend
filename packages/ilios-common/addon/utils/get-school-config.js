/**
 * A list of school config items that we will be backfilled as TRUE if missing.
 * @type {Set<string>}
 */
const treatMissingValueAsTrue = new Set(['showMeSH']);

/**
 * An async callback function that returns a Promise resolving to the school
 * that owns the given model object.
 * @callback schoolLoaderCallback The callback function.
 * @param {Object} o The data model object.
 * @return {Promise<Object[]>} The promise resolving to a school model object.
 */
/**
 * Retrieves school configuration settings for the school associated with a given data model.
 * The model/school association will be resolved through a given callback function.
 *
 * @param {schoolLoaderCallback} cb A callback function.
 * @param {Object} o A data model object.
 * @returns {Promise<Object>} A plain object holding key/value pairs of school configuration settings.
 */
export default async function getSchoolConfigs(cb, o) {
  // some light type checking
  if (typeof cb !== 'function') {
    throw new Error('Given callback is not a function.');
  }

  // invoke the callback, get the school.
  const school = await cb(o);
  if (!school) {
    throw new Error('Unable to load school from the given object.');
  }

  // now get the school config.
  // todo: Consider adding caching of config values by school here. [ST 2026/09/10]
  const configs = await school.configurations;

  // map config values by their names.
  const rhett = new Map();
  configs.forEach((config) => {
    rhett.set(config.name, config.parsedValue);
  });

  // backfill missing config data and set them to true.
  treatMissingValueAsTrue.forEach((key) => {
    if (!rhett.has(key)) {
      rhett.set(key, true);
    }
  });

  // convert the map back to an object so we can use it in templates.
  return Object.fromEntries(rhett);
}
