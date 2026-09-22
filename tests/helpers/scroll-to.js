import { findOne } from 'ember-cli-page-object/extend';

export default function scrollTo(selector = null, userOptions = {}) {
  return {
    isDescriptor: true,

    get(key) {
      const options = {
        pageObjectKey: key,
        ...userOptions,
      };

      const element = findOne(this, selector, options);

      return () => {
        element.scrollIntoView({
          behavior: 'instant',
          block: 'center',
          container: 'nearest',
        });

        return this;
      };
    },
  };
}
