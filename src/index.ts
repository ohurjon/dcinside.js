import { Author } from "./classes/Author.js";
import { Client } from "./classes/Client.js";
import { Gallery } from "./classes/Gallery.js";
import { Document } from "./classes/Document.js";
import { DocumentIndex } from "./classes/DocumentIndex.js";
import { Image } from "./classes/Image.js";
import { Util } from "./classes/Util.js";
import { Comment } from "./classes/Comment.js";

const DOCS_PER_PAGE = 200;

const USER_AGENT =
  "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36";

const GET_HEADERS = {
  "User-Agent": USER_AGENT,
};

const XML_HTTP_REQ_HEADERS = {
  Accept: "*/*",
  Connection: "keep-alive",
  "User-Agent": USER_AGENT,
  "X-Requested-With": "XMLHttpRequest",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.5",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
};

const POST_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": USER_AGENT,
};

const GALLERY_POSTS_COOKIES = {
  __gat_mobile_search: 1,
  list_count: DOCS_PER_PAGE,
};

export {
  Author,
  Client,
  Document,
  DocumentIndex,
  Util,
  Gallery,
  Image,
  Comment,
  USER_AGENT,
  GET_HEADERS,
};
