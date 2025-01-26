// https://stackoverflow.com/a/53033388

(async () => {
    const src = chrome.runtime.getURL("./js/content_main.js");
    const contentMain = await import(src);
    contentMain.main();
  })();