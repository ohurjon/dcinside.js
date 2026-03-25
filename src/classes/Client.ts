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
    documentIdLowerLimit?: number | null,
  ): Promise<DocumentIndex[]>;
  document(boardId: string, documentId: number): Promise<Document>;
  comments(
    boardId: string,
    documentId: number,
    num?: number,
    startPage?: number,
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

  async watch(boardId: string, delay: number, limit: number | null = null) {
    let lastIndex = 0;

    this.emit("task", `Watching board: ${boardId}`);

    while (true) {
      this.emit("debug", `Fetching updates for board: ${boardId}`);
      const list = await this.board(
        boardId,
        20,
        1,
        false,
        limit,
        lastIndex + 1,
      );

      list.reverse().forEach((data: DocumentIndex) => {
        this.emit("verbose", `${boardId} ${data.subject} - ${data.title}`);
        this.emit("update", data);
        lastIndex = data.id;
      });

      if (limit == lastIndex) {
        this.emit("debug", `Reached limit of ${limit}. Stopping watch.`);
        break;
      }

      await this.util.sleep(delay * 1000);
    }
  }

  gallery(id: string | null): Promise<Gallery[]> {
    return new Promise(async (resolve, reject) => {
      let url = "https://m.dcinside.com/galltotal";

      try {
        const response = await this.session.get(url);
        const html = response.data.trim();
        const converter = new GalleryListConverter(this);

        const data = converter.convert(html);

        if (id) {
          const gallery = data.get(id);

          if (gallery == undefined) {
            resolve([]);
          } else {
            resolve([gallery]);
          }
        } else {
          resolve(Array.from(data.values()));
        }
      } catch (err) {
        if (err instanceof AxiosError) {
          console.error("AxiosError:", err);
          reject("Network Error Occurred : " + err.message);
        } else {
          console.error("Unknown error:", err);
          reject("Unknown error while fetching gallery list: " + err);
        }
      }
    });
  }

  board(
    boardId: string,
    num: number = 30,
    startPage: number = 1,
    recommend: boolean = false,
    documentIdUpperLimit: number | null = null,
    documentIdLowerLimit: number | null = null,
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
        this.emit("debug", `Fetching board data from: ${url}`);

        const response = await this.session.get(url);
        const html = response.data.trim();

        const converter = new DocumentIndexListConverter(this, boardId);
        const data: DocumentIndex[] = converter.convert(html);
        this.emit(
          "debug",
          `Fetched ${data.length} documents from page ${page} of board ${boardId}`,
        );

        this.emit(
          "verbose",
          `Document IDs on page ${page}: ${data.map((d) => d.id).join(", ")}`,
        );

        const indexes = Array.from(data.values());

        this.emit(
          "verbose",
          `Processing ${indexes.length} documents from page ${page}`,
        );

        for (const indexData of indexes) {
          this.emit("verbose", `Processing document : ${indexData}`);
          const id = indexData.id;
          if (num <= result.length) {
            // num이 이미 충족된 경우, 더 이상 문서를 추가하지 않고 루프를 종료합니다.
            this.emit("debug", `Reached limit of ${num} documents. Stopping.`);
            stop = true;
          } else {
            if (documentIdLowerLimit == null || id >= documentIdLowerLimit) {
              if (documentIdUpperLimit == null || id <= documentIdUpperLimit) {
                // 문서가 범위 내에 있는 경우 결과에 추가합니다.
                this.emit("debug", `Adding document ${id} to results`);
                result.push(indexData);
              }
            } else {
              // 문서가 범위 밖에 있는 경우, 더 이상 문서를 추가하지 않고 루프를 종료합니다.
              this.emit(
                "debug",
                `Skipping document ${id} as it is outside the specified range`,
              );
              stop = true;
            }
          }
        }
        if (stop) {
          // 더 이상 페이지를 가져올 필요가 없으므로 결과를 반환합니다.
          this.emit(
            "debug",
            `Completed fetching documents for board ${boardId}`,
          );
          resolve(result);
        } else {
          page += 1;
        }
        this.emit(
          "debug",
          `Completed processing page ${page - 1} of board ${boardId}`,
        );
      }
      reject("Unexpected error while fetching board data");
    });
  }

  document(boardId: string, documentId: number): Promise<Document> {
    return new Promise((resolve, reject) => {
      this.emit(
        "debug",
        `Fetching document ${documentId} from board ${boardId}...`,
      );
      const url = `https://m.dcinside.com/board/${boardId}/${documentId}`;
      console.debug(`Fetching document ${documentId} from board ${boardId}...`);
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
    startPage = 1,
  ): Promise<Comment[]> {
    //TODO
    throw "Not implemented";
  }
}
