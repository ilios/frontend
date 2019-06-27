import setupMirage from './setup';
import ENV from 'dummy/config/environment';

const { apiVersion } = ENV;

export default function () {
  this.namespace = '/';
  setupMirage(this);

  this.get('application/config', function() {
    return { config: {
      type: 'form',
      apiVersion,
    }};
  });
}
