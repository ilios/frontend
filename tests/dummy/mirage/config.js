import setupMirage from 'ilios-common/mirage/setup';

export default function () {
  this.timing = 100;
  this.namespace = '/';
  setupMirage(this);
}
