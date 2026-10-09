/**
 * Add preloading for critical fonts
 *
 * Because we don't know the path of the font we use a `pre` transform which puts the
 * node_modules path in index.html and then let's vite clean that up.
 */
export default function preloadFonts() {
  return {
    name: 'ilios-preload-fonts',
    apply: 'build',

    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          getPreLoad('nunito-latin-wght-normal.woff2'),
          getPreLoad('nunito-latin-wght-italic.woff2'),
        ];
      },
    },
  };
}

function getPreLoad(file) {
  return {
    tag: 'link',
    attrs: {
      rel: 'preload',
      href: `/node_modules/@fontsource-variable/nunito/files/${file}`,
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous',
    },
  };
}
