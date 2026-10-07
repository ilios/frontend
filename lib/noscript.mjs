/**
 * Add noscript tag to our index.html
 */
export default function noscript() {
  return {
    name: 'ilios-noscript',

    transformIndexHtml() {
      return [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/noscript.css',
          },
          injectTo: 'head',
        },
        ...getHtmlTags(),
      ];
    },
  };
}

function getHtmlTags() {
  return [
    {
      tag: 'noscript',
      children: `
        <p>
          For full functionality of this site it is necessary to enable JavaScript.
          Here are the <a href="https://www.enable-javascript.com/">
          instructions on how to enable JavaScript in your web browser</a>.
        </p>
      `,
      injectTo: 'body-prepend',
    },
  ];
}
