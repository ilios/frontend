import packageJson from '../package.json' with { type: 'json' };

const VERSION_FILE = 'VERSION.txt';

/**
 * Vite Plugin to put the current frontend version (as read from package.json) into
 * the app to be consumed.
 */
export default function versionFile() {
  return {
    name: 'ilios-version-file',

    /**
     * Add the VERSION file to the final output
     * @see https://rolldown.rs/reference/Interface.Plugin#generatebundle
     */
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: VERSION_FILE,
        source: packageJson.version,
      });
    },

    /**
     * Respond to requests for the VERSION file in development
     * @see https://vite.dev/guide/api-plugin#configureserver
     */
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith(`/${VERSION_FILE}`)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end(packageJson.version);
          return;
        }

        next();
      });
    },
  };
}
