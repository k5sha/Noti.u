document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("bookmarks");

  chrome.storage.local.get(null, (result) => {
    const keys = Object.keys(result);

    if (keys.length === 0) {
      container.innerHTML = `<p class="empty-state">No reminders yet.</p>`;
      return;
    }

    keys.forEach((url) => {
      const reminders = result[url];
      if (!Array.isArray(reminders) || reminders.length === 0) return;

      const wrapper = document.createElement("div");
      wrapper.className = "bookmark";

      const pageUrl = document.createElement("div");
      pageUrl.className = "page-url";
      pageUrl.textContent = url;

      wrapper.appendChild(pageUrl);

      reminders.forEach((reminder, index) => {
        const div = document.createElement("div");
        let text = reminder.selectedText || 'Highlight';

        const words = text.trim().split(/\s+/);
        if (words.length > 12) {
          text = words.slice(0, 12).join(' ') + '…';
        }

        div.textContent = `🔖 ${text}`;

        const del = document.createElement("button");
        del.textContent = "✕";
        del.className = "delete-btn";
        del.onclick = () => {
          const updated = reminders.filter((_, i) => i !== index);
          if (updated.length === 0) {
            chrome.storage.local.remove(url, () => location.reload());
          } else {
            chrome.storage.local.set({ [url]: updated }, () => location.reload());
          }
        };

        div.appendChild(del);
        wrapper.appendChild(div);
      });

      const openBtn = document.createElement("button");
      openBtn.className = "open-btn";
      openBtn.textContent = "Open page";
      openBtn.onclick = () => chrome.tabs.create({ url });
      wrapper.appendChild(openBtn);

      container.appendChild(wrapper);
    });
  });
});
