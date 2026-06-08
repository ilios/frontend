/**
 * Creates a dummy JWT from the given data.
 * Note that generated token lacks encryption and signature,
 * but that's still good enough for most testing purposes.
 *
 * @param {object} jwtObject The data to encode in the JWT
 * @returns {string} The created JWT.
 */
export default function (jwtObject = {}) {
  return window.btoa('') + '.' + window.btoa(JSON.stringify(jwtObject)) + '.';
}
