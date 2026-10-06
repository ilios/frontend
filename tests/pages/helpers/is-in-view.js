import { findOne } from 'ember-cli-page-object/extend';

export default function isInView(selector = null, userOptions = {}) {
  return {
    isDescriptor: true,

    get(key) {
      return async () => {
        const element = findOne(this, selector, {
          pageObjectKey: key,
          ...userOptions,
        });

        return new Promise((resolve) => {
          const observer = new IntersectionObserver(([entry]) => {
            observer.disconnect();
            resolve(entry.isIntersecting);
          });

          observer.observe(element);
        });
      };
    },
  };
}
