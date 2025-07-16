/** Optional arguments object type definition.
* @typedef {object} Options The Optional arguments object.
* @property {?string} description - The lang key for "description" text that is interpolated into error messages.
* @property {?boolean} showAll - TRUE to return all error messages, FALSE to only return the first one (default).
/
/**
 * Gets translated error messages for given validation errors.
 * @param {object} intl The I18n service object.
 * @param {?array} validationErrors A list of validation errors.
 * @param {?Options} options Optional arguments.
 * @returns {array} A list of error messages.
 */
export default function validationMessages(intl, validationErrors, options) {
  const description = options?.description;
  const showAll = !!options?.showAll;

  const messages = validationErrors?.map(({ messageKey, values }) => {
    if (!values) {
      values = {};
    }
    if (description) {
      values.description = description;
    } else {
      values.description = intl.t('errors.description');
    }

    return intl.t(messageKey, values);
  });
  if (messages) {
    if (showAll) {
      return messages;
    } else {
      // only return the first message, as an array.
      return messages.slice(0, 1);
    }
  }
  return [];
}
