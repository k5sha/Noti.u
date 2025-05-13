function getUniqueSelector(el) {
  if (!(el instanceof Element)) return null;
  if (el.id) return `#${CSS.escape(el.id)}`;

  const path = [];
  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();

    if (el.parentNode) {
      const siblings = Array.from(el.parentNode.children);
      const sameTagSiblings = siblings.filter(
        (s) => s.nodeName === el.nodeName
      );
      if (sameTagSiblings.length > 1) {
        const index = siblings.indexOf(el) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    path.unshift(selector);
    el = el.parentElement;
  }

  return path.join(" > ");
}

function isAlreadyHighlighted(range) {
  const ancestor = range.commonAncestorContainer;
  if (ancestor.nodeType === Node.ELEMENT_NODE) {
    return (
      ancestor.closest(
        'span[style*="background-color: rgb(240, 240, 240); color: rgb(0, 0, 0); padding: 0px 2px;'
      ) !== null
    );
  } else if (ancestor.nodeType === Node.TEXT_NODE && ancestor.parentElement) {
    return (
      ancestor.parentElement.closest(
        'span[style*="background-color: rgb(240, 240, 240); color: rgb(0, 0, 0); padding: 0px 2px;"]'
      ) !== null
    );
  }
  return false;
}

document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  if (selection.isCollapsed) return;

  const range = selection.getRangeAt(0);

  if (isAlreadyHighlighted(range)) return;

  const containerElement =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement;

  const selector = getUniqueSelector(containerElement);
  const rect = range.getBoundingClientRect();

  const button = document.createElement("button");
  button.textContent = "🔔";
  button.style = `
    position: absolute;
    left: ${window.scrollX + rect.right}px;
    top: ${window.scrollY + rect.top - 30}px;
    z-index: 1000;
    padding: 6px 12px;
    border: none;
    border-radius: 12px;
    background: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    font-size: 14px;
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    transition: background 0.3s ease;
  `;

  button.onmouseover = () =>
    (button.style.background = "rgba(255, 179, 0, 0.5)");
  button.onmouseout = () => (button.style.background = "#ffffff");

  button.onclick = () => {
    button.remove();
    const span = document.createElement("span");
    span.style.backgroundColor = "#f0f0f0";
    span.style.color = "#000";
    span.style.padding = "0 2px";
    span.appendChild(range.extractContents());
    range.insertNode(span);

    const cleanedText = selection.toString().trim();

    const obj = {
      selector: selector,
      selectedText: cleanedText,
      type: "text",
    };

    chrome.storage.local.get([document.location.href], (result) => {
      const existingData = result[document.location.href] || [];
      existingData.push(obj);
      chrome.storage.local.set(
        { [document.location.href]: existingData },
        () => {
          console.log("Stored reminder:", obj);
        }
      );
    });

    const note = document.createElement("span");
    note.textContent = "📝 You asked to be reminded";
    note.style = `
      display: inline-block;
      margin-left: 12px;
      font-size: 14px;
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      border-radius: 12px;
      padding: 6px 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      color: #333;
      font-weight: bold;
      white-space: nowrap;
      cursor: pointer;
      transition: opacity 0.3s ease;
      opacity: 0.9;
      position: absolute;
      z-index: 9999;
    `;

    const spanRect = span.getBoundingClientRect();
    note.style.position = "absolute";
    note.style.left = `${
      window.scrollX + spanRect.left + spanRect.width + 10
    }px`;
    note.style.top = `${window.scrollY + spanRect.top - 12}px`;

    const deleteText = document.createElement("small");
    deleteText.textContent = "Click to delete";
    deleteText.style.display = "block";
    deleteText.style.fontSize = "10px";
    deleteText.style.color = "#777";
    deleteText.style.marginTop = "2px";

    note.appendChild(deleteText);

    note.onclick = () => {
      chrome.storage.local.get([document.location.href], (result) => {
        const existingData = result[document.location.href] || [];
        const updatedData = existingData.filter(
          (item) => item.selectedText !== cleanedText
        ); // Remove specific reminder
        chrome.storage.local.set(
          { [document.location.href]: updatedData },
          () => {
            window.location.reload();
          }
        );
      });
    };

    document.body.appendChild(note);

    selection.removeAllRanges();
  };

  document.body.appendChild(button);

  const removeOnClickOutside = (e) => {
    if (!button.contains(e.target)) {
      button.remove();
      document.removeEventListener("mousedown", removeOnClickOutside);
    }
  };
  document.addEventListener("mousedown", removeOnClickOutside);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "restoreHighlights") {
    setTimeout(() => {
      request.data.forEach((item) => {
        const el = document.querySelector(item.selector);
        if (!el) {
          console.warn("Element not found for selector:", item.selector);
          return;
        }

        const range = document.createRange();
        range.selectNodeContents(el);

        const span = document.createElement("span");
        span.style.backgroundColor = "#f0f0f0";
        span.style.color = "#000";
        span.style.padding = "0 2px";
        span.appendChild(range.extractContents());
        range.insertNode(span);

        const note = document.createElement("span");
        note.textContent = "📝 You asked to be reminded";
        note.style = `
          display: inline-block;
          margin-left: 12px;
          font-size: 14px;
          font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          border-radius: 12px;
          padding: 6px 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          color: #333;
          font-weight: bold;
          white-space: nowrap;
          cursor: pointer;
          transition: opacity 0.3s ease;
          opacity: 0.9;
          position: absolute;
          z-index: 9999;
      `;

        const spanRect = span.getBoundingClientRect();
        note.style.left = `${
          window.scrollX + spanRect.left + spanRect.width + 10
        }px`;
        note.style.top = `${window.scrollY + spanRect.top - 12}px`;

        const deleteText = document.createElement("small");
        deleteText.textContent = "Click to delete";
        deleteText.style = `
        display: block;
        font-size: 10px;
        color: #777;
        margin-top: 2px;
      `;
        note.appendChild(deleteText);

        note.onclick = () => {
          chrome.storage.local.get([document.location.href], (result) => {
            const arr = result[document.location.href] || [];
            const filtered = arr.filter((r) => r.selector !== item.selector);
            chrome.storage.local.set(
              { [document.location.href]: filtered },
              () => {
                window.location.reload();
              }
            );
          });
        };

        document.body.appendChild(note);
      });
    }, 500);
  }
});
