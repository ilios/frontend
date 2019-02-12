import setupMirage from './setup';

export default function () {
  this.timing = 100;
  this.namespace = '/';
  setupMirage(this);
};
