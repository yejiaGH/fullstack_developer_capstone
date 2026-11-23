// Local production build of the React application.
//
// The canonical command is `npm run build` (react-scripts).  In the
// sandboxed file system used by WorkBuddy a plain `fs.mkdir` of a nested
// folder is rejected with EIO, which webpack cannot recover from, so the
// output folders are pre-created here before webpack starts.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

const fs = require('fs');
const path = require('path');
const fsx = require('fs-extra');
const webpack = require('webpack');
const configFactory = require('react-scripts/config/webpack.config');
const paths = require('react-scripts/config/paths');

const OUTPUT_SUBDIRS = ['static', 'static/css', 'static/js', 'static/media'];

fsx.emptyDirSync(paths.appBuild);
OUTPUT_SUBDIRS.forEach(function (sub) {
  fs.mkdirSync(path.join(paths.appBuild, sub), { recursive: true });
});

// Copy the public folder, the same way react-scripts does it.  The
// index.html is skipped because webpack generates it with HtmlWebpackPlugin.
fsx.copySync(paths.appPublic, paths.appBuild, {
  dereference: true,
  filter: function (file) {
    return file !== paths.appHtml;
  }
});

const config = configFactory('production');

webpack(config).run((err, stats) => {
  if (err) {
    console.log('=== RAW ERROR ===');
    console.log(err.stack || err);
    process.exit(1);
  }
  console.log(stats.toString({ colors: false, chunks: false, modules: false }));
  if (stats.hasErrors()) {
    process.exit(1);
  }
});
