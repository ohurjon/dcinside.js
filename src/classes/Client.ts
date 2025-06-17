import axios, { AxiosError, AxiosInstance } from "axios";

import EventEmitter from "events";

import {
  GalleryListConverter,
  DocumentIndexListConverter,
  DocumentConverter,
} from "./converts/index.js";
import {
  Gallery,
  Document,
  DocumentIndex,
  GET_HEADERS,
  Util,
} from "../index.js";

interface IClient {
  watch(boardId: string, delay: number, limit?: number | null): void;
  gallery(name?: string | null): Promise<Gallery[]>;
  board(
    boardId: string,
    num?: number,
    startPage?: number,
    recommend?: boolean,
    documentIdUpperLimit?: number | null,
    documentIdLowerLimit?: number | null
  ): Promise<DocumentIndex[]>;
  document(boardId: string, documentId: number): Promise<Document>;
  comments(
    boardId: string,
    documentId: number,
    num?: number,
    startPage?: number
  ): Promise<Comment[]>;
  // writeComment(
  //   boardId: number,
  //   documentId: number,
  //   contents?: string,
  //   dcconId?: string,
  //   dcconSrc?: string,
  //   parentCommentId?: string,
  //   name?: string,
  //   password?: string,
  //   isMinor?: boolean
  // ): Promise<void>;
  // modifyDocument(
  //   boardId: number,
  //   documentId: number,
  //   title?: string,
  //   contents?: string,
  //   name?: string,
  //   password?: string,
  //   isMinor?: boolean
  // ): Promise<void>;
  // removeDocument(
  //   boardId: number,
  //   documentId: number,
  //   password?: string,
  //   isMinor?: boolean
  // ): Promise<void>;
  // writeDocument(
  //   boardId: number,
  //   title?: string,
  //   contents?: string,
  //   name?: string,
  //   password?: string,
  //   isMinor?: boolean
  // ): Promise<void>;
  // createDocument(
  //   boardId: number,
  //   title?: string,
  //   contents?: string,
  //   name?: string,
  //   password?: string,
  //   intermediate?: string | null,
  //   intermediate_referer?: string | null,
  //   documentId?: number | null,
  //   isMinor?: boolean
  // ): Promise<void>;
  // access(
  //   tokenVerify: string,
  //   targetUrl: string,
  //   requireConkey?: boolean,
  //   csrfToken?: string | null
  // ): Promise<void>;
}

export class Client extends EventEmitter implements IClient {
  session: AxiosInstance;
  util: Util;

  constructor() {
    super();

    this.session = axios.create({
      headers: { ...GET_HEADERS },
      withCredentials: true,
    });

    this.util = new Util();
  }

  watch(boardId: string, delay: number, limit: number | null = null) {
    let lastIndex = 0;

    this.emit("ready");

    while (true) {
      this.board(boardId, 20, 1, false, limit, lastIndex + 1)
        .then((list) => {
          list.reverse().forEach((data) => {
            this.emit("update", data);
            lastIndex = data.id;
          });
        })
        .catch((err) => {
          throw new Error("Error while fetching board data:", err);
        });
      if (limit == lastIndex) {
        break;
      }
      this.util.sleep(delay * 1000);
    }
  }

  gallery(name: string | null): Promise<Gallery[]> {
    return new Promise((resolve, reject) => {
      let url = "https://m.dcinside.com/galltotal";

      this.session
        .get(url)
        .then((response) => {
          let html = response.data;

          const converter = new GalleryListConverter(this);
          if (name) {
            const data = converter.convert(html).get(name);

            if (data == undefined) {
              resolve([]);
            } else {
              resolve([data]);
            }
          } else {
            resolve(Array.from(converter.convert(html).values()));
          }
        })
        .catch((err) => {
          if (err instanceof AxiosError) {
            reject("Network Error Occurred : " + err.message);
          } else {
            reject("Unknown error while fetching gallery list: " + err);
          }
        });
    });
  }

  board(
    boardId: string,
    num: number = 30,
    startPage: number = 1,
    recommend: boolean = false,
    documentIdUpperLimit: number | null = null,
    documentIdLowerLimit: number | null = null
  ): Promise<DocumentIndex[]> {
    return new Promise(async (resolve, reject) => {
      let page = startPage;

      let result: DocumentIndex[] = [];

      let stop = false;
      while (!stop) {
        let url = `https://m.dcinside.com/board/${boardId}?page=${page}`;
        if (recommend) {
          url = `https://m.dcinside.com/board/${boardId}?recommend=1&page=${page}`;
        }

        this.session.get(url).then((response) => {
          const html = response.data.trim();

          const converter = new DocumentIndexListConverter(this, boardId);
          const indexes = Array.from(converter.convert(html).values());

          for (const indexData of indexes) {
            const id = indexData.id;

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
          }
          if (stop) {
            resolve(result);
          } else {
            page += 1;
          }
        });
      }
    });
  }

  document(boardId: string, documentId: number): Promise<Document> {
    return new Promise((resolve, reject) => {
      const url = `https://m.dcinside.com/board/${boardId}/${documentId}`;
      this.session
        .get(url)
        .then((response) => {
          const html = response.data.trim();
          const converter = new DocumentConverter(this, documentId, boardId);

          resolve(converter.convert(html));
        })
        .catch((err) => {
          if (err instanceof AxiosError) {
            throw new Error("Network Error Occurred: " + err.message);
          } else {
            throw new Error("Unknown error while fetching document: " + err);
          }
        });
    });
  }

  comments(
    boardId: string,
    documentId: number,
    num = -1,
    startPage = 1
  ): Promise<Comment[]> {
    //TODO
    throw "Not implemented";
  }
}
