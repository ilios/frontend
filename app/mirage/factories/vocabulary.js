import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
    title: (i) => `vocabulary ${i}`,
    topics: []
});
