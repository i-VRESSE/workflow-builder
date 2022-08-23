const { mergeConfig } = require("vite");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-interactions"],
  core: {
    builder: "@storybook/builder-vite",
  },
  framework: "@storybook/react",
  async viteFinal(config) {
    // return the customized config
    return mergeConfig(config, {
      // To solve error `Big integer literals are not available in the configured target environment ("chrome87", "edge88", "es2019", "firefox78", "safari13.1")`
      // of which es2019 and safari31.1 are not compatible with bigint according to
      // https://github.com/evanw/esbuild/blob/0d4fae1f97b2013b78a293f1f19607df062a52f1/internal/compat/js_table.go#L262-L270
      // bigints are used in @ltd/j-toml as its a dependency we only have to change the target of the deps
      // So overwrite target with target which are bigint compatible
      // For `yarn build-storybook` overwrite build target
      build: {
        target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
        sourcemap: false
      },
      // For `yarn storybook` overwrite build target for dependencies
      optimizeDeps: {
        esbuildOptions: {
          target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
        },
      },
      base: "", // Make storybook-static work in non / path
    });
  },
};
