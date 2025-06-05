import { register, permutateThemes, expandTypesMap } from '@tokens-studio/sd-transforms';
import StyleDictionary from 'style-dictionary';
import { promises } from 'fs';

register(StyleDictionary, {
  /* options here if needed */
});

async function run() {
  const $themes = JSON.parse(await promises.readFile('tokens/$themes.json', 'utf-8'));
  const themes = permutateThemes($themes, { separator: '_' });
  const configs = Object.entries(themes).map(([name, tokensets]) => ({
    source: tokensets.map(tokenset => `tokens/${tokenset}.json`),
    preprocessors: ['tokens-studio'], // <-- since 0.16.0 this must be explicit
    expand: {
      typesMap: expandTypesMap,
    },
    platforms: {
      css: {
        transformGroup: 'tokens-studio',
        transforms: ['name/kebab'],
        files: [
          {
            destination: `build/${name}.css`,
            format: 'css/variables',
            options: {
              outputReferences: true,
            },
          },
        ],
      },
    },
  }));

  async function cleanAndBuild(cfg) {
    const sd = new StyleDictionary(cfg);
    await sd.cleanAllPlatforms(); // optionally, cleanup files first..
    await sd.buildAllPlatforms();
  }
  await Promise.all(configs.map(cleanAndBuild));
}

run();