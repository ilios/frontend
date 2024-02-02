import { Factory } from 'miragejs';

export default Factory.extend({
  id: 2013,
  title: function () {
    return `${this.id} - ` + (this.id + 1);
  },
});
