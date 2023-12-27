import "./style.css";

const currentTab = await getCurrentTab();
await executeScriptInTab(currentTab);

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function executeScriptInTab(currentTab: chrome.tabs.Tab) {
  const selection = await getSelection(currentTab);
  const title = selection || currentTab.title;
  const url = currentTab.url;
  await copy(`[${title}](${url})`);
}

async function getSelection(tab: chrome.tabs.Tab) {
  try {
    const [{ result: selection }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id! },
      func: getSelectedText,
    });
    return selection;
  } catch (e) {
    return;
  }
}

function getSelectedText() {
  return window.getSelection()!.toString();
}

async function copy(plain: string) {
  const listener = (event: any) => {
    event.clipboardData.setData("text/plain", plain);
    event.preventDefault();
  };
  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
}
