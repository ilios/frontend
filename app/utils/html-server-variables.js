let htmlValues;

const getValueFromHtml = function (name) {
  fillHtmlValues();
  return htmlValues.get(name);
};

const fillHtmlValues = function () {
  if (!htmlValues) {
    htmlValues = new Map();
    //find all elements that start with `iliosconfig`
    const elements = document.querySelectorAll(`head meta[name^=iliosconfig]`);
    elements.forEach(({ name, content }) => {
      const key = name.replace('iliosconfig-', '');
      htmlValues.set(key, content);
    });
  }
};

export { getValueFromHtml };
