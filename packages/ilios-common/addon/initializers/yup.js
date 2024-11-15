import { setLocale } from 'yup';

export function initialize(application) {
  const owner = application.lookup ? application : application.__container__;
  const intl = owner.lookup('service:intl');

  setLocale({
    mixed: {
      required: required(intl),
    },
    string: {
      min: min(intl, ['min']),
      max: max(intl, ['max']),
    },
  });
}

export default {
  initialize,
};

function required(intl) {
  return (validationParams) => {
    const description = intl.t('errors.description');
    const message = intl.t('errors.blank', { description });
    return {
      path: validationParams.path,
      message,
    };
  };
}

function max(intl) {
  return (validationParams) => {
    const description = intl.t('errors.description');
    const message = intl.t('errors.tooLong', { description, max: validationParams.max });
    return {
      path: validationParams.path,
      message,
    };
  };
}

function min(intl) {
  return (validationParams) => {
    const description = intl.t('errors.description');
    const message = intl.t('errors.tooShort', { description, min: validationParams.min });
    return {
      path: validationParams.path,
      message,
    };
  };
}
