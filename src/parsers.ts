interface Feed {
  id: string;
  name: string;
  url: string;
  read: string[];
}

interface Entry {
  id: string;
  title: string;
  link: string;
  date: Date;
  icon: string;
  author: string;
  feed: string;
  thumbnail?: string;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
}

import atom from "./parsers/atom";
import rss from "./parsers/rss";

const parsers: Array<(src: string, feed: Feed) => undefined | Entry[]> = [
  atom,
  rss
];

async function fetchEntries(feed: Feed) {
  const src = await (await fetch(feed.url)).text();
  for (const parser of parsers) {
    const result = parser(src, feed);
    if (result) return result;
  }
}

export { Feed, Entry, fetchEntries };
