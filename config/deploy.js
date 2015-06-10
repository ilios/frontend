/* jshint node: true */

module.exports = {
  production: {
    store: {
      type: "S3",
      bucket: "iliosindex",
      acl: 'public-read',
      indexMode: "indirect",
    },
    assets: {
      type: "s3",
      bucket: "ilioscdn",
      exclude: ['.DS_Store', '*-test.js']
    }
  },
  staging: {
    buildEnv: 'staging',
    store: {
      type: "S3",
      bucket: "dev-iliosindex",
      acl: 'public-read',
      indexMode: "indirect",
    },
    assets: {
      type: "s3",
      bucket: "dev-ilioscdn",
      exclude: ['.DS_Store', '*-test.js']
    }
  }
};
