import { Feed } from "../parsers";
import "./find.scss";

const link = document.createElement("a");
const feedLinks = document.querySelectorAll(
  'link[type="application/rss+xml"], link[type="application/atom+xml"]'
);

const newFeeds: Feed[] = [];
for (const f of feedLinks) {
  link.href = f.getAttribute("href")!;
  newFeeds.push({
    name: f.getAttribute("title")!,
    url: link.href
  });
}

/*const prompt =
  "Add the following feeds?\n" + newFeeds.map(f => f.name).join("\n");*/

if (newFeeds.length === 0) alert("Sorry, no feeds were found");
else {
  const div = document.createElement("div");
  const shadow = div.attachShadow({ mode: "open" });
  (div.style as any).all = "initial";
  shadow.innerHTML = `
  <link rel="stylesheet" href="${browser.runtime.getURL("find/find.css")}" />
  <div id="dialog">
    <h2>Add the following feeds?</h2>
    <div id="feeds">
      ${newFeeds
        .map(f => `<input type="checkbox"> <span>${f.name}</span>`)
        .join("\n    ")}
    </div>
    <div id="buttons">
      <button id="yes">Yes</button>
      <button id="no">No</button>
    </div>
  </div>`;
  document.body.appendChild(div);

  shadow
    .getElementById("no")!
    .addEventListener("click", () =>
      document.getElementById("dialog")!.remove()
    );

  shadow.getElementById("yes")!.addEventListener("click", async () => {
    const checkboxes = shadow.querySelectorAll("input[type=checkbox]");
    const filteredFeeds = newFeeds.filter(
      (_, i) => (checkboxes[i] as HTMLInputElement).checked
    );

    const feeds: Feed[] = (await browser.storage.sync.get({ feeds: [] })).feeds;
    // Remove duplicates
    let i = feeds.length;
    while (i--) {
      if (filteredFeeds.some(f => f.url === feeds[i].url)) {
        feeds.splice(i, 1);
      }
    }
    browser.storage.sync.set({
      feeds: feeds.concat(filteredFeeds) as any
    });

    div.remove();
  });

  shadow.getElementById("no")!.addEventListener("click", () => div.remove());
}
