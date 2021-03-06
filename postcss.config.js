const isHotReloaded = process.argv.includes('serve');

class TailwindVueExtractor {
  static extract(content) {
    const contentWithoutStyleBlocks = content.replace(/<style[^]+?<\/style>/gi, '');
    return contentWithoutStyleBlocks.match(/[A-Za-z0-9-_:/]+/g) || [];
  }
}

const extensionsUsingCSS = ['vue', 'html'];
const extensionsOfCSS = ['css', 'less', 'pcss', 'postcss', 'sass', 'scss', 'styl'];

module.exports = {
  plugins: [
    require('postcss-import')(),
    require('postcss-url')(),
    require('postcss-preset-env')(),
    require('cssnano')({
      preset: 'default',
    }),
    require('tailwindcss')('./tailwind.config.js'),
    !isHotReloaded &&
      require('@fullhuman/postcss-purgecss')({
        content: [`./@(public|src)/**/*.@(${extensionsUsingCSS.join('|')})`],
        css: [`./src/**/*.@(${extensionsOfCSS.join('|')})`],
        extractors: [
          {
            extractor: TailwindVueExtractor,
            extensions: extensionsUsingCSS,
          },
        ],
        whitelist: [],
        whitelistPatterns: [
          /-(leave|enter|appear)(|-(to|from|active))$/,
          /^(?!(|.*?:)cursor-move).+-move$/,
          /^router-link(|-exact)-active$/,
        ],
      }),
  ],
};
