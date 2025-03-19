// Environment
const env = process.env.NODE_ENV || 'development';
console.log(`Build environment: ${env}`);
const singleId = process.env.SINGLE_ID || 'generic';
const isDev = env === 'development';
const isPre = env === 'preview';
const isProd = env === 'production';
let isSingle = false;
// BASE
const gulp = require('gulp');
// UTIL
const gutil = require('gulp-util');
const concat = require('gulp-concat');
const gulpif = require('gulp-if');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const fs = require('fs');
// HTML
const cheerio = require('gulp-cheerio');
// JSON
const jeditor = require('gulp-json-editor');
// JS/CSS
const header = require('gulp-header');
// JS
const buble = require('gulp-buble');
const uglify = require('gulp-uglify');
// CSS
const gulpsass = require('gulp-sass');
const cleanCSS = require('gulp-clean-css');

let CLIENT_DATA = require('./client-data.json');

const sassMethod = isDev ? 'expanded' : 'compressed';

// Build header
const nowDate = new Date();
const FP_VERSION = '5.0.1';
const versionHeaderBase = `Revolution Viewing Ltd. - Floorplan Master - v${FP_VERSION} - {{CLIENT_NAME}} - Build date: ${nowDate.getDate()}.${nowDate.getMonth() + 1}.${nowDate.getFullYear()}`;

// Helper
if (isProd) {
  console.log(
    `You can use "ROBOCOPY C:\\_dev\\_rv-internal\\rv-floorplan-master\\02-dist W:\\webfiles\\rv-touch\\clients\\floorplan-v${FP_VERSION} rv.floorplan.js rv.slideout.css /E" to transfer specific files to the server`,
  );
}

// COPYRIGHT
const copyrightText = `&#169; ${nowDate.getFullYear()} Revolution Viewing Ltd.`;

// DEPENDENCIES
const htmlSources = ['components/html/index.html'];
const animationSources = [
  'components/scripts/greensock/plugins/CSSPlugin.js',
  'components/scripts/greensock/TweenLite.js',
];
const utilitySources = [
  'components/scripts/utilities/jquery-3.3.1.min.js',
  'components/scripts/utilities/gyro2.js',
  'components/scripts/utilities/krpano.js',
  'components/scripts/utilities/webvr.js',
];
const jsSources = ['components/scripts/rv.floorplan.js'];
const sassSources = [
  'components/sass/style.scss',
  'components/sass/page-surround.scss',
];

// Utilities
const getEnvDir = () => {
  return isSingle ? '00-dev' : isPre ? '01-preview' : '02-dist';
};
const getParentDir = (clientId) => {
  return isSingle
    ? '00-dev'
    : `${isPre ? '01-preview' : '02-dist'}/${clientId}`;
};
const getOutputDir = (clientId) => {
  return `${getParentDir(clientId)}/${isPre ? '' : 'upload'}`;
};
const getDirAll = (dir) => `${dir}/**/*`;

// TASKS
const assetDirs = ['client-assets', 'client-static', 'dev-static'];
gulp.task('static', function (done) {
  if (!isPre && !isSingle) {
    gulp
      .src(getDirAll('dev-static'))
      .pipe(gulp.dest(`${getEnvDir()}/00-assets`));
  }

  CLIENT_DATA.forEach(({ id }) => {
    const outputDir = getParentDir(id);

    if (isPre) {
      gulp.src(getDirAll('client-static/upload')).pipe(gulp.dest(outputDir));

      gulp
        .src(getDirAll(`client-assets/${id}/upload`))
        .pipe(gulp.dest(outputDir));
    } else {
      gulp.src(getDirAll('client-static')).pipe(gulp.dest(outputDir));

      gulp.src(getDirAll(`client-assets/${id}`)).pipe(gulp.dest(outputDir));
    }
  });

  done();
});

gulp.task('php', function (done) {
  CLIENT_DATA.forEach(function ({ id, name, client_embed_width, index_php }) {
    const { filename, custom } = index_php || {};
    const outputDir = getOutputDir(id);
    const psFileName = filename ? `${filename}.php` : 'ps.php';
    const pageSurroundLocation = custom
      ? `components/php/${id}/ps.php`
      : 'components/php/_template/ps.php';

    gulp
      .src(pageSurroundLocation)
      .pipe(rename(psFileName))
      .pipe(replace('{{CLIENT_ID}}', id))
      .pipe(replace('{{CLIENT_NAME}}', name))
      .pipe(replace(`'{{CLIENT_EMBED_WIDTH}}'`, client_embed_width))
      .pipe(gulp.dest(outputDir));
  });

  done();
});

gulp.task('html-index', function (done) {
  CLIENT_DATA.forEach(({ id, name, gtm_code, index_html, welcome_html }) => {
    const { head_font, client_logo_name, forwarder_btn_text, welcomeTemplate } =
      index_html || {};
    const fontHtml = head_font ? head_font.join('') : '';
    const clientLogoName = client_logo_name || 'client-logo.jpg';
    const forwarderBtnText = forwarder_btn_text || 'Tap to start';
    const outputDir = getOutputDir(id);
    const removeGtm = !gtm_code || !isProd;

    // Welcome screen stuff
    const welcomeHtml = welcome_html || {};
    const welcomeHtml_p = welcomeHtml.p || [];
    const welcomeHtml_p_joined = welcomeHtml_p.join('');
    const welcomeHtml_start_btn_text =
      welcomeHtml.start_btn_text || 'Start the tour';
    const welcomeHtmlPath = `components/html/templates/welcome-${welcomeTemplate || 'default'}.html`;
    const welcomeHtmlContent = fs.readFileSync(welcomeHtmlPath, 'utf8');

    gulp
      .src(htmlSources)
      // Head / Footer
      .pipe(replace('<!-- CLIENT_FONT -->', fontHtml))
      .pipe(
        gulpif(
          removeGtm,
          cheerio(function ($, file) {
            $('.gtm-script').remove();
          }),
        ),
      )
      .pipe(gulpif(!removeGtm, replace('{{GTM_CODE}}', gtm_code)))
      // Welcome stuff
      .pipe(
        cheerio(function ($, file) {
          $('#welcome-container').append(welcomeHtmlContent);
        }),
      )
      // Text replace
      .pipe(replace('{{CLIENT_NAME}}', name))
      .pipe(replace('{{CLIENT_LOGO_NAME}}', clientLogoName))
      .pipe(replace('<!-- WELCOME HTML - P -->', welcomeHtml_p_joined))
      .pipe(replace('{{START BUTTON TEXT}}', welcomeHtml_start_btn_text))
      .pipe(replace('{{CLIENT_LOGO_NAME}}', clientLogoName))
      .pipe(replace('{{FORWARDER_BTN_TEXT}}', forwarderBtnText))
      .pipe(replace('{{FP_VERSION}}', FP_VERSION))
      .pipe(replace('{{COPYRIGHT}}', copyrightText))
      // Output
      .pipe(gulp.dest(outputDir));
  });

  done();
});

gulp.task('json', function (done) {
  CLIENT_DATA.forEach(({ id, global_json }) => {
    const outputDir = getOutputDir(id);

    gulp
      .src('components/json/global.json')
      .pipe(jeditor(global_json || {}))
      .pipe(replace('{{FP_VERSION}}', FP_VERSION))
      .pipe(gulp.dest(outputDir));
  });

  done();
});

gulp.task('js', function (done) {
  CLIENT_DATA.forEach(({ id, name, client_embed_width }) => {
    const outputDir = getOutputDir(id);
    const clientVersionHeader = versionHeaderBase.replace(
      '{{CLIENT_NAME}}',
      name,
    );

    gulp
      .src(animationSources)
      .pipe(concat('animations.min.js').on('error', gutil.log))
      .pipe(uglify().on('error', gutil.log))
      .pipe(header(`/* ${clientVersionHeader} */\r\n`)) // HEADER
      .pipe(gulp.dest(`${outputDir}/js`));

    gulp.src(utilitySources).pipe(gulp.dest(`${outputDir}/js`));

    gulp
      .src(jsSources)
      .pipe(gulpif(isDev, replace(`VERSION_HEADER`, clientVersionHeader))) // HEADER
      .pipe(replace('{{ENVIRONMENT}}', env))
      .pipe(replace(`{{CLIENT_EMBED_WIDTH}}`, client_embed_width || 768))
      .pipe(
        buble({
          transforms: {
            arrow: true,
            letConst: true,
            templateString: true,
          },
        }).on('error', gutil.log),
      )
      .pipe(gulpif(!isDev, uglify().on('error', gutil.log)))
      .pipe(gulpif(!isDev, header(`/* ${clientVersionHeader} */\r\n`))) // HEADER
      .pipe(gulp.dest(`${outputDir}/js`));
  });

  done();
});

gulp.task('xml', function (done) {
  CLIENT_DATA.forEach(({ id }) => {
    const outputDir = getOutputDir(id);

    gulp
      .src('components/xml/*.xml')
      .pipe(replace('{{FP_VERSION}}', FP_VERSION))
      .pipe(replace('{{COPYRIGHT}}', copyrightText))
      .pipe(gulpif(!isDev, replace(' showerrors="true" logkey="true"', '')))
      .pipe(gulp.dest(`${outputDir}/xml`));
  });

  done();
});

gulp.task('sass', function (done) {
  CLIENT_DATA.forEach(({ id, name, client_embed_width, index_php }) => {
    const { custom } = index_php || {};
    const outputDir = getOutputDir(id);
    const clientVersionHeader = versionHeaderBase.replace(
      '{{CLIENT_NAME}}',
      name,
    );

    gulp
      .src(sassSources)
      .pipe(gulpif(isDev, replace(`VERSION_HEADER`, clientVersionHeader))) // HEADER
      .pipe(
        gulpif(
          client_embed_width,
          replace(
            `$embed-width: 768px;`,
            `$embed-width: ${client_embed_width}px;`,
          ),
        ),
      )
      .pipe(
        gulpif(
          custom,
          replace(
            `/*@import "clients/{{CLIENT_ID}}-ps";*/`,
            `@import "clients/${id}-ps";`,
          ),
        ),
      )
      .pipe(replace('{{CLIENT_ID}}', id))
      .pipe(replace('{{CLIENT_NAME}}', name))
      .pipe(gulpsass({ outputStyle: sassMethod }).on('error', gutil.log))
      .pipe(gulpif(!isDev, cleanCSS({ compatibility: 'ie8' })))
      .pipe(gulpif(!isDev, header(`/* ${clientVersionHeader} */\r\n`))) // HEADER
      .pipe(gulp.dest(`${outputDir}/css`));
  });

  done();
});

gulp.task('dev-tools', function (done) {
  CLIENT_DATA.forEach(({ id, name }) => {
    const outputDir = getParentDir(id);
    const clientVersionHeader = versionHeaderBase.replace(
      '{{CLIENT_NAME}}',
      name,
    );

    gulp
      .src('components/dev/save-json.php')
      .pipe(gulp.dest(`${outputDir}/dev/inc`));

    gulp
      .src('components/dev/*.html')
      .pipe(replace('{{FP_VERSION}}', FP_VERSION))
      .pipe(replace('{{CLIENT_NAME}}', name))
      .pipe(replace('{{COPYRIGHT}}', copyrightText))
      .pipe(gulp.dest(`${outputDir}/dev`));

    gulp
      .src('components/dev/script.js')
      .pipe(replace('{{FP_VERSION}}', FP_VERSION))
      .pipe(replace('{{CLIENT_NAME}}', name))
      .pipe(gulpif(isDev, replace(`VERSION_HEADER`, clientVersionHeader))) // HEADER
      .pipe(
        buble({
          transforms: {
            arrow: true,
            letConst: true,
            templateString: true,
          },
        }).on('error', gutil.log),
      )
      .pipe(gulpif(!isDev, uglify().on('error', gutil.log)))
      .pipe(gulpif(!isDev, header(`/* ${clientVersionHeader} */\r\n`))) // HEADER
      .pipe(gulp.dest(`${outputDir}/dev/inc`));

    gulp
      .src('components/dev/style.scss')
      .pipe(gulpif(isDev, replace(`VERSION_HEADER`, clientVersionHeader))) // HEADER
      .pipe(gulpsass({ outputStyle: sassMethod }).on('error', gutil.log))
      .pipe(gulpif(!isDev, header(`/* ${clientVersionHeader} */\r\n`))) // HEADER
      .pipe(gulp.dest(`${outputDir}/dev/inc`));
  });

  done();
});

gulp.task('watch', function (done) {
  // Watch Assets
  gulp.watch(assetDirs.map(getDirAll), gulp.parallel('static'));

  // Watch PHP
  gulp.watch(getDirAll('components/php'), gulp.parallel('php'));

  // Watch HTML
  gulp.watch(getDirAll('components/html'), gulp.parallel('html-index'));

  // Watch JSON
  gulp.watch(getDirAll('components/json'), gulp.parallel('json'));

  // Watch JavaScript
  gulp.watch(getDirAll('components/scripts'), gulp.parallel('js'));

  // Watch XML
  gulp.watch(getDirAll('components/xml'), gulp.parallel('xml'));

  // Watch SASS
  gulp.watch(getDirAll('components/sass'), gulp.parallel('sass'));

  // Watch Builder / Migration
  gulp.watch(getDirAll('components/dev'), gulp.parallel('dev-tools'));

  done();
});

// Default
const tasksArray = [
  gulp.parallel(
    'static',
    'php',
    'html-index',
    'json',
    'js',
    'xml',
    'sass',
    'dev-tools',
  ),
];
if (isDev) {
  tasksArray.push('watch');
}
gulp.task('default', gulp.series(...tasksArray));

// Single
gulp.task(
  'single',
  gulp.series(
    function (done) {
      console.log(`Single ID: ${singleId}`);
      isSingle = true;
      CLIENT_DATA = CLIENT_DATA.filter(({ id }) => id === singleId);
      done();
    },
    ...tasksArray,
  ),
);
