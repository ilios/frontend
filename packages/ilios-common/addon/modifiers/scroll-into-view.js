import { modifier } from 'ember-modifier';
import { default as scroll } from 'ilios-common/utils/scroll-into-view';

export default modifier(function scrollIntoView(element, positional, { disabled, opts }) {
  scroll(element, { disabled, opts });
});
