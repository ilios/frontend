const handler = {
  get: function (obj, prop) {
    if ('type' === prop) {
      if (obj.isBlanked) {
        return 'unknown';
      }
      if (obj.citation) {
        return 'citation';
      } else if (obj.link) {
        return 'link';
      } else {
        return 'file';
      }
    }
    return obj[prop];
  },
};

export default function createTypedLearningMaterialProxy(lm) {
  return new Proxy(lm, handler);
}
