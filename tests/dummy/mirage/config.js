import setupMirage from './setup';

export default function () {
  this.namespace = '/';
  setupMirage(this);
}
