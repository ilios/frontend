module.exports = {
  //we need to go up two directories to get to the root of the monorepo
  reporters: [['lcov', { projectRoot: '../..' }], 'html'],
};
