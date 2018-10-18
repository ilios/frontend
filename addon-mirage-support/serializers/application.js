import { RestSerializer } from 'ember-cli-mirage';

export default RestSerializer.extend({
  serializeIds: 'always',
  normalizeIds: 'always',
});
