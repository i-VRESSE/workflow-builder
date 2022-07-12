module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-docs",
  ],
  core: {
    builder: "@storybook/builder-vite",
  },
  framework: "@storybook/react",
  async viteFinal(config) {
    config.build = {};
    // To solve error `Big integer literals are not available in the configured target environment ("chrome87", "edge88", "es2019", "firefox78", "safari13.1")`
    // of which es2019 and safari31.1 are not compatible with bigint according to
    // https://github.com/evanw/esbuild/blob/0d4fae1f97b2013b78a293f1f19607df062a52f1/internal/compat/js_table.go#L262-L270
    // So overwrite target with bigint compatible onces
    config.build.target = [
      "es2020",
      "edge88",
      "firefox78",
      "chrome87",
      "safari14",
    ];
    // addon-interactions uses jest which needs global, which is only available in nodejs, but now needed in brow
    config.define = {
      global: "window",
    };
    return config;
  },
};
