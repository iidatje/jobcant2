import {
  test as base,
  expect,
  chromium,
  BrowserContext,
} from "@playwright/test";

const test = base.extend({
  context: async ({}, use) => {
    const pathToExtension =
      process.env.CHROME_EXTENSION_DIR +
      "/ppnbnpeolgkicgegkbkbjmhlideopiji/1.0.7_0";
    console.log(">>>> extension path: " + pathToExtension);
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [background] = context.serviceWorkers();
    if (!background) background = await context.waitForEvent("serviceworker");

    const extensionId = background.url().split("/")[2];
    await use(extensionId);
  },
});

module.exports.test = test;
module.exports.expect = expect;
