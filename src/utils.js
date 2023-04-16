/**
 * Generates a random string of the give length made up of the allowed characters.
 *
 * @param {number} [length=10] - Length of resulting string.
 * @param {string} [allowed=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789] - Characters allowed in the results.
* @returns {string}
*/
export function randomString(
  length = 10,
  allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) {
  let result = '';
  for (let index = 0; index < length; index++) {
    result += allowed.charAt(Math.floor(Math.random() * allowed.length));
  }
  return result;
}

/** @typedef {"string"|"number"|"boolean"|"array"|"function"|"null"|"undefined"|"object"} TypesUnion */
/**
 * @param {unknown} v
 */
export function getRawType(v) {
  const type = /** @type {TypesUnion} */ (
    Object.prototype.toString.call(v).slice(8, -1).toLowerCase()
  );
  return type;
}

/**
 * @param {unknown} v
 * @param {TypesUnion} type
 */
export function isType(v, type) {
  return getRawType(v) === type;
}

/**
 * @param {Array<string|number>} list
 */
export function listFormatter(list) {
  const formatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  });
  return formatter.format(list);
}
