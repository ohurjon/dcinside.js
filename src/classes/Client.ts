import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";

import { installErrorInterceptor } from "../lib/error-interceptor.js";

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

import https from "https";
import http from "http";
import { AnyARecord } from "dns";

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
      baseURL: "https://m.dcinside.com",
      timeout: 3000,
      headers: { ...GET_HEADERS },
      withCredentials: true,
    });

    this.util = new Util();

    installErrorInterceptor(this, this.session);
  }

  watch(
    boardId: string,
    delay: number,
    limit: number | null = null,
    lastIndex: number = 0,
  ): void {
    this.emit("task", `Watching board: ${boardId}`);

    this.emit(
      "debug",
      `${boardId} 갤러리에서 ${delay} 초 마다 문서를 확인합니다. (lastIndex: ${lastIndex})`,
    );

    this.board(boardId, 20, 1, false, limit, lastIndex + 1).then((data) => {
      data.reverse().forEach((data: DocumentIndex) => {
        this.emit("verbose", `${boardId} ${data.subject} - ${data.title}`);
        if (data.id > lastIndex) {
          this.emit("update", data);
        } else {
          this.emit(
            "debug",
            `문서 ${data.id}는 ${lastIndex}보다 오래되었습니다. 건너뜁니다.`,
          );
        }

        lastIndex = data.id;
      });
      if (limit && limit <= lastIndex) {
        this.emit(
          "debug",
          `${limit} 제한에 도달했습니다.  ${boardId} 갤러리 감시를 종료합니다.`,
        );
        return;
      }
      setTimeout(() => {
        this.watch(boardId, delay, limit, lastIndex);
      }, delay * 1000);
    });
  }

  gallery(id: string | null): Promise<Gallery[]> {
    return new Promise(async (resolve, reject) => {
      let url = "/galltotal";

      const response = await this.session.get(url, { retry: 3 });
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
    });
  }

  board(
    boardId: string,
    num: number = 30,
    startPage: number = 1,
    recommend: boolean = false,
    documentIdUpperLimit: number | null = null,
    documentIdLowerLimit: number | null = null,
    page: number = startPage,
    result: DocumentIndex[] = [],
  ): Promise<DocumentIndex[]> {
    return new Promise((resolve, reject) => {
      let url = `/board/${boardId}?page=${page}`;
      if (recommend) {
        url = `/board/${boardId}?recommend=1&page=${page}`;
      }

      this.emit(
        "debug",
        `${boardId} 갤러리에서 ${startPage} 페이지부터 ${num} 개의 게시물을 불러옵니다...`,
      );

      this.session.get(url, { retry: 5 }).then((response) => {
        const html = response!.data.trim();

        const converter = new DocumentIndexListConverter(this, boardId);
        const data: DocumentIndex[] = converter.convert(html);

        this.emit(
          "debug",
          `${boardId} 갤러리에서 ${data.length}개의 문서를 ${page}페이지에서 불러왔습니다.`,
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
          if (
            documentIdLowerLimit == null ||
            indexData.id >= documentIdLowerLimit
          ) {
            if (
              documentIdUpperLimit == null ||
              indexData.id <= documentIdUpperLimit
            ) {
              // 문서가 범위 내에 있는 경우 결과에 추가합니다.
              this.emit(
                "debug",
                `${boardId} 갤러리에서 문서 ${indexData.id}를 검색 결과에 추가합니다.`,
              );
              if (result.length < num) {
                this.emit(
                  "debug",
                  `result에 ${indexData.id} 문서를 추가합니다. (현재 result 길이: ${result.length}, 목표: ${num})`,
                );
                result.push(indexData);
              } else {
                this.emit(
                  "debug",
                  `${page} 페이지에서 ${indexes.length}개의 문서를 찾았고, 조건에 맞는 결과가 충분하여 반환합니다. (result length: ${result.length}, required: ${num})`,
                );
                resolve(result);
                return;
              }
            }
          } else {
            this.emit(
              "debug",
              `문서 ${indexData.id}는 ${documentIdLowerLimit}보다 오래되었습니다. 건너뜁니다.`,
            );
            resolve(result);
            return;
          }
        }

        this.emit(
          "debug",
          `${boardId} 갤러리 ${page} 페이지에서 ${indexes.length}개의 문서를 찾았으나 조건에 맞지 않아 다음 페이지를 불러옵니다... (result length: ${result.length}, required: ${num})`,
        );
        resolve(
          this.board(
            boardId,
            num,
            startPage,
            recommend,
            documentIdUpperLimit,
            documentIdLowerLimit,
            page + 1,
            result,
          ),
        );
      });
    });
  }

  document(boardId: string, documentId: number): Promise<Document> {
    return new Promise((resolve, reject) => {
      this.emit(
        "debug",
        ` ${boardId} 갤러리에서 ${documentId}번 문서 가져오는 중...`,
      );
      const url = `/board/${boardId}/${documentId}`;

      this.session.get(url, { retry: 5 }).then(
        (response) => {
          const html = response.data.trim();
          const converter = new DocumentConverter(this, documentId, boardId);
          resolve(converter.convert(html));
        },
        (error) => {
          this.emit(
            "error",
            `${boardId} 갤러리에서 ${documentId}번 문서 가져오기 실패 : ${error.message}`,
          );
          reject(error);
        },
      );
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
