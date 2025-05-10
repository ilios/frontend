/**
 * Custom transformer method to strip markup from a given string.
 */
export default function stripMarkup(value) {
  const text = value || '';
  const noTagsText = text.replace(/(<([^>]+)>)/gi, '');
  const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');
  return strippedText.trim();
}
