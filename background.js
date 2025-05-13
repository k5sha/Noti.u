// Create random delay between 24h (1440min) and 72h (4320min)
function scheduleRandomReminder() {
  const delayInMinutes = Math.floor(Math.random() * (4320 - 1440 + 1)) + 1440;
  chrome.alarms.create("reminderAlarm", { delayInMinutes });
  console.log("Next reminder scheduled in", delayInMinutes, "minutes");
}

chrome.runtime.onInstalled.addListener(() => {
  scheduleRandomReminder();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleRandomReminder();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reminderAlarm") {
    chrome.storage.local.get(null, (data) => {
      const urls = Object.keys(data);
      if (urls.length === 0) return;

      const randomUrl = urls[Math.floor(Math.random() * urls.length)];
      const items = data[randomUrl];
      if (!Array.isArray(items) || items.length === 0) return;

      const randomItem = items[Math.floor(Math.random() * items.length)];
      const text = randomItem.selectedText?.split(" ").slice(0, 25).join(" ") + "…";

      chrome.notifications.create({
        type: "basic",
        iconUrl: "assets/icon.png",
        title: "⏰ Noti.u Reminder",
        message: `Remember this: "${text}"`,
        contextMessage: new URL(randomUrl).hostname,
        priority: 1
      });

      scheduleRandomReminder(); 
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.storage.local.get([tab.url], (result) => {
      const dataArray = result[tab.url];
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        console.log('No data to restore for', tab.url);
        return;
      }

      console.log('Restoring highlights:', dataArray);
      chrome.tabs.sendMessage(tabId, { type: "restoreHighlights", data: dataArray });
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "saveData") {
    const { url, data } = request; 

    chrome.storage.local.get([url], (result) => {
      let existingData = result[url] || [];

      if (!existingData.some(item => item.selector === data.selector)) {
        existingData.push(data); 
        chrome.storage.local.set({ [url]: existingData }, () => {
          console.log('Data saved successfully');
        });
      } else {
        console.log('Data already exists for this selector');
      }
    });
  }
});
