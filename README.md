# Noti.u — Chrome Extension for Highlight-Based Reminders

**Noti.u** is a lightweight Chrome extension that lets you save highlighted text on any webpage and receive random reminder notifications about it later.

## 🧩 Features

* Save selected text from any webpage
* Visual highlighting of saved text
* Random notifications reminding you of saved content
* Reminder manager with options to view and delete saved texts

## 📸 Screenshots


![image](https://github.com/user-attachments/assets/e273ab3c-c9b8-4fec-8d19-6366ea55ddf5)




## 🚀 Installation

### Option 1: From Chrome Web Store *(Recommended)*

> [👉 Install Noti.u from Chrome Web Store](https://chromewebstore.google.com/detail/dfbjgkobnicdengobbigledhcjnhlopg?utm_source=item-share-cb)

### Option 2: Manual Installation (For Developers)

1. Clone or download the repository
2. Go to `chrome://extensions/` in your Chrome browser
3. Enable **Developer Mode** (top right)
4. Click **Load unpacked** and select the folder with the extension files

## 🛠 Project Structure

* `manifest.json` — Extension manifest
* `background.js` — Background script (notification logic)
* `contentScript.js` — Content script (handles highlighting and saving text)
* `popup.html` — UI for the reminder manager
* `assets/icon.png` — Extension icon

## 📦 Dependencies

No third-party libraries — pure JavaScript.

## ✅ Permissions

* `storage` — Save and manage reminders
* `tabs` — Access active tab info
* `alarms` — Schedule random notifications
* `notifications` — Display Chrome notifications

## 🧪 How It Works

1. Highlight any text on a webpage
2. Click the 🔔 button that appears
3. The text is saved and visually highlighted
4. After a random interval (24–72 hours), a Chrome notification reminds you about it
5. Manage or delete reminders from the popup interface

## 🧹 Deleting Reminders

In the popup manager, click the ✕ button next to a saved text to delete it.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
