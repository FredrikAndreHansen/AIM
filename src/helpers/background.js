chrome.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    chrome.action.setBadgeBackgroundColor({ color: '#9F0000' }, () => {
      chrome.action.setBadgeText({text: String(newValue)});
    });
  }
});