module.exports = function (env) {
  return {
    errorOnMissingTranslations: env === 'test',
  };
};
