const axios = require("axios");
const cheerio = require("cheerio");

const { convert } = require("html-to-text");

const DocumentIndex = require("./DocumentIndex").DocumentIndex;
const Document = require("./Document").Document;
const Image = require("./Image").Image;

const { parseSubject, parseTime, parseTitle, sleep } = require("./Util");
const EventEmitter = require("events");

DOCS_PER_PAGE = 200;

GET_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36",
};
XML_HTTP_REQ_HEADERS = {
  Accept: "*/*",
  Connection: "keep-alive",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36",
  "X-Requested-With": "XMLHttpRequest",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.5",
  "X-Requested-With": "XMLHttpRequest",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
};

POST_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9,ko;q=0.8",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  Pragma: "no-cache",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36",
};

GALLERY_POSTS_COOKIES = {
  __gat_mobile_search: 1,
  list_count: DOCS_PER_PAGE,
};

class Client extends EventEmitter {
  constructor() {
    super();
    this.session = axios.create({
      headers: { ...GET_HEADERS },
      withCredentials: true,
    });
  }

  async watch(boardId, delay, limit = null) {
    let lastIndex = 0;

    this.emit("ready");

    while (true) {
      const list = await this.board(
        boardId,
        20,
        1,
        false,
        limit,
        lastIndex + 1
      );

      list.reverse().forEach((data) => {
        this.emit("update", data);
        lastIndex = data.id;
      });

      if (limit == lastIndex) {
        break;
      }
      await sleep(delay);
    }
  }

  async gallery(name = null) {
    let url = "https://m.dcinside.com/galltotal";
    let gallerys = {};

    const response = await this.session.get(url);
    let html = response.data;

    let $ = cheerio.load(html);
    let data = $(".gall-lst li a");
    data.toArray().forEach((element) => {
      const boardName = element.children[0].data;
      const boardUrl = element.attribs.href;
      const boardId = boardUrl.split("/").pop();

      if (name == null) {
        gallerys[boardName] = boardId;
      } else {
        if (boardName.includes(name)) {
          gallerys[boardName] = boardId;
        }
      }
    });
    return gallerys;
  }

  async board(
    boardId,
    num = 30,
    startPage = 1,
    recommend = false,
    documentIdUpperLimit = null,
    documentIdLowerLimit = null
  ) {
    let page = startPage;

    let result = [];

    let stop = false;
    while (!stop) {
      let url = `https://m.dcinside.com/board/${boardId}?page=${page}`;
      if (recommend) {
        url = `https://m.dcinside.com/board/${boardId}?recommend=1&page=${page}`;
      }
      const response = await this.session.get(url);
      const html = response.data.trim();

      const $ = cheerio.load(html);
      let data = $(".gall-detail-lst .gall-detail-lnktb");

      data.each((index, e) => {
        const element = $(e);

        const documentUrl = element.find("a.lt").attr("href");

        let id = documentUrl.split("/").pop();

        if (id.includes("?")) {
          id = id.split("?")[0];
        }

        const typeClass = element.find(".sp-lst").attr("class");
        let type = "txt"; //sp-lst-txt
        if (typeClass.includes("img")) type = "img";
        if (typeClass.includes("play")) type = "play";

        const recommand = typeClass.includes("reco");

        const title = element.find(".subjectin").text();

        const ginfo = element.find(".ginfo").children();
        const subject = ginfo[0].children[0].data;

        const authorName = element.next().attr("data-name");
        const authorId = element.next().attr("data-info");

        const time = parseTime(ginfo[2].children[0].data);

        const viewCount = ginfo[3].children[0].data.split(" ").pop();

        const commentCount = element.find(".ct").text();

        const voteupCount = ginfo[4].children[1].children[0].data;

        let indexData = new DocumentIndex(
          id,
          boardId,
          type,
          recommand,
          title,
          subject,
          { name: authorName, id: authorId },
          time,
          viewCount,
          voteupCount,
          commentCount,
          () => {
            return this.document(boardId, id);
          },
          null
        );
        if (num <= result.length) {
          stop = true;
          return;
        } else {
          if (
            (documentIdLowerLimit == null || id >= documentIdLowerLimit) &&
            (documentIdUpperLimit == null || id <= documentIdUpperLimit)
          ) {
            result.push(indexData);
          } else {
            stop = true;
            return;
          }
        }
      });
      if (stop) {
        return result;
      } else {
        page += 1;
      }
    }
  }

  async document(boardId, documentId) {
    const url = `https://m.dcinside.com/board/${boardId}/${documentId}`;
    const response = await this.session.get(url);
    const html = response.data;

    let $ = cheerio.load(html);

    $(".adv-groupno").remove();

    let header = $(".gallview-tit-box");
    let gallview = $(".gall-thum-btm-inner");
    let content = $(".thum-txtin");

    const fullTitle = $(header).find(".tit").text().trim();
    const title = parseTitle(fullTitle);
    const subject = parseSubject(fullTitle);

    let ctBox = $(".ct-box");

    const header_ginfo = $(header).find(".ginfo2").children();
    const gallView_ginfo = $(gallview).find(".ginfo2").children();

    let authorName = "ㅇㅇ";
    let authorId = "(123.45)";

    if (header_ginfo[0].children[0].tagName == "a") {
      authorName = header_ginfo[0].children[0].children[0].data;
      authorId = header_ginfo[0].children[0].attribs.href.split("/").pop();
    } else {
      const dbehd = header_ginfo[0].children[0].data;
      authorName = dbehd.split("(")[0];
      authorId = dbehd.split("(")[1].split(")")[0];
    }

    let contents = convert(content.html(), {
      selectors: [{ selector: "img", format: "skip" }],
    });

    const images = [];

    content
      .find("img")
      .toArray()
      .forEach((element) => {
        const src = element.attribs["data-original"];
        images.push(new Image(src, documentId, boardId, this.session));
      });

    const viewCount = parseInt(
      gallView_ginfo[0].children[0].data.split(" ").pop()
    );
    const time = parseTime(header_ginfo[1].children[0].data);
    const voteupCount = parseInt(ctBox.find("#recomm_btn.ct").text());
    const votedownCount = 0;
    const loginedVoteupCount = parseInt(
      ctBox.find("#recomm_btn_member.num").text()
    );

    return new Document(
      documentId,
      boardId,
      title,
      subject,
      { name: authorName, id: authorId },
      time,
      viewCount,
      voteupCount,
      votedownCount,
      loginedVoteupCount,
      contents,
      images,
      content.html().trim(),
      []
    );
  }

  async comments(boardId, documentId, num = -1, startPage = 1) {
    //TODO
    throw "Not implemented";
  }

  async writeComment(
    boardId,
    documentId,
    contents = "",
    dcconId = "",
    dcconSrc = "",
    parentCommentId = "",
    name = "",
    password = "",
    isMinor = false
  ) {
    //TODO
    throw "Not implemented";
  }

  async modifyDocument(
    board_id,
    documentId,
    title = "",
    contents = "",
    name = "",
    password = "",
    isMinor = false
  ) {
    //TODO
    throw "Not implemented";
  }

  async removeDocument(boardId, documentId, password = "", isMinor = false) {
    //TODO
    throw "Not implemented";
  }

  async removeDocument(boardId, documentId, password = "", isMinor = false) {
    //TODO
    throw "Not implemented";
  }

  async writeDocument(
    boardId,
    title = "",
    contents = "",
    name = "",
    password = "",
    isMinor = false
  ) {
    //TODO
    throw "Not implemented";
  }

  async createDocument(
    boardId,
    title = "",
    contents = "",
    name = "",
    password = "",
    intermediate = null,
    intermediate_referer = null,
    documentId = null,
    isMinor = false
  ) {
    //TODO
    throw "Not implemented";
  }

  async access(tokenVerify, targetUrl, requireConkey = true, csrfToken = null) {
    //TODO
    throw "Not implemented";
  }
}

exports.Client = Client;
