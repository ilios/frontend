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
  }
};
