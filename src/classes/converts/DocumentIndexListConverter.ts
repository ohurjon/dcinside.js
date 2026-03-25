import { IConverter } from "../Converter.js";

import * as cheerio from "cheerio";
import { Author, Client, DocumentIndex } from "../../index.js";

/**
 * HTML을 DocumentIndex 객체로 변환하는 클래스
 * @implements {Converter}
 * @param {string} input - HTML 문자열
 * @returns {DocumentIndex[]} - 변환된 DocumentIndex 객체
 */
export class DocumentIndexListConverter implements IConverter {
  boardId: string;
  client: Client;

  constructor(client: Client, boardId: string) {
    if (!boardId || typeof boardId !== "string") {
      throw new TypeError("boardId must be a non-empty string");
    }
    this.boardId = boardId;
    this.client = client;
  }

  convert(input: string): DocumentIndex[] {
    if (input == null || input.trim() === "") {
      throw new TypeError("Input cannot be null or empty");
    }

    const $ = cheerio.load(input);

    // 글 목록을 가져오기
    let data = $(".gall-detail-lst .gall-detail-lnktb");

    if (data.length === 0) {
      // 글 목록이 없으면 빈 배열 반환
      console.warn("No document indexes found in the input HTML.");
      return [];
    }

    let documentIndexes: DocumentIndex[] = [];

    data.each((_, e) => {
      const element = $(e);

      const documentUrl: string | undefined = element.find("a.lt").attr("href");

      if (documentUrl == undefined) {
        throw new Error("Document URL not found in element");
      }

      let id: string | undefined = documentUrl!.split("/").pop();

      if (id == undefined) {
        throw new Error("Document ID not found in URL : " + documentUrl);
      }

      if (id!.includes("?")) {
        id = id!.split("?")[0];
      }

      const documentId: number = parseInt(id, 10);

      const typeClass: string | undefined = element
        .find(".sp-lst")
        .attr("class");

      if (typeClass == undefined) {
        throw new Error("Type class not found in element");
      }

      let type = "txt"; //sp-lst-txt
      if (typeClass!.includes("img")) type = "img";
      if (typeClass!.includes("play")) type = "play";

      const recommend = typeClass!.includes("reco");

      const title = element.find(".subjectin").text();

      const ginfo = element.find(".ginfo").children();

      const subject = $(ginfo[0]).text();

      const authorName = element.next().attr("data-name");

      if (authorName == undefined) {
        throw new Error("Author name not found in element");
      }
      const authorId = element.next().attr("data-info");
      if (authorId == undefined) {
        throw new Error("Author ID not found in element");
      }

      const authorType = element.find(".sp-nick")[0];

      let author: Author;
      if (authorType != null) {
        const nickType = authorType.attribs.class;
        if (nickType == "sp-nick nogonick") {
          author = new Author(authorId, authorName, true, false, false, false);
        }
        if (nickType == "sp-nick gonick") {
          author = new Author(authorId, authorName, true, true, false, false);
        }

        if (nickType == "sp-nick sub-gonick") {
          author = new Author(authorId, authorName, true, true, false, true);
        }

        if (nickType == "sp-nick m-gonick") {
          author = new Author(authorId, authorName, true, true, true, false);
        }
      } else {
        author = new Author(authorId, authorName, false, false, false, false);
      }

      const time = this.client.util.parseTime($(ginfo[2]).text());

      const viewCount: number = parseInt(
        $(ginfo[3]).text().split(" ").pop()!,
        10,
      );

      const commentCount: number = parseInt(element.find(".ct").text(), 10);

      const voteupCount: number = parseInt($(ginfo[4].children[0]).text(), 10);

      const documentIndex = new DocumentIndex(
        this.client,
        documentId,
        this.boardId,
        type,
        recommend,
        title,
        subject,
        author!,
        time,
        viewCount,
        voteupCount,
        commentCount,
      );

      documentIndexes.push(documentIndex);
    });
    return documentIndexes;
  }
}
