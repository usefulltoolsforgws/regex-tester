chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openTab") {
    chrome.tabs.create({ url: request.url });
  }
});

// New code to open a URL when the extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "https://regex-tester.tilda.ws/" });
  }
});
