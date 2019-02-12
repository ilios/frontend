import Mirage from 'ember-cli-mirage';

export default function () {
  this.timing = 100;
  this.namespace = '/';
  setupMirage(this);
};
