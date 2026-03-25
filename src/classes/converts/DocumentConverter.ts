import { Author, Client, Document, Image } from "../../index.js";
import { IConverter } from "../Converter.js";

import * as cheerio from "cheerio";

import { convert } from "html-to-text";

export class DocumentConverter implements IConverter {
  client: Client;
  documentId: number;
  boardId: string;
  constructor(client: Client, documentId: number, boardId: string) {
    this.client = client;
    this.documentId = documentId;
    this.boardId = boardId;
  }

  parseSubject(text: string): string | null {
    const match = text.match(/\[(.*?)\]/); // 첫 번째 대괄호 안의 내용 추출
    return match ? match[1] : null; // 매칭된 값이 있으면 반환, 없으면 null
  }

  parseTitle(text: string): string {
    return text.replace(/^\[.*?\]\s*/, ""); // 첫 번째 []와 뒤 공백 제거
  }

  convert(html: string): Document {
    let $ = cheerio.load(html);

    $(".adv-groupno").remove();

    let header = $(".gallview-tit-box");
    let gallview = $(".gall-thum-btm-inner");
    let content = $(".thum-txtin");

    const fullTitle = $(header).find(".tit").text().trim();
    const title = this.parseTitle(fullTitle);
    const subject = this.parseSubject(fullTitle);

    let ctBox = $(".ct-box");

    const header_ginfo = $(header).find(".ginfo2");
    const gallView_ginfo = $(gallview).find(".ginfo2").children();

    const ginfo_area = $(header_ginfo).find(".ginfo-area span");

    const ginfoAreaTypeAttribute = ginfo_area[0].attributes[0];

    let author = undefined;

    if (ginfoAreaTypeAttribute != undefined) {
      const authorName = $("#real_name")[0].attribs["value"];
      // console.log(authorName);
      const nickType = ginfoAreaTypeAttribute.value;
      const id = $(header_ginfo)
        .find(".ginfo-area a")[0]
        .attribs.href.split("/")[2];
      if (nickType == "sp-nick nogonick") {
        author = new Author(id, authorName, true, false, false, false);
      }
      if (nickType == "sp-nick gonick") {
        author = new Author(id, authorName, true, true, false, false);
      }

      if (nickType == "sp-nick sub-gonick") {
        author = new Author(id, authorName, true, true, false, true);
      }

      if (nickType == "sp-nick m-gonick") {
        author = new Author(id, authorName, true, true, true, false);
      }
    } else {
      const authorName = $(header_ginfo)
        .find(".ginfo-area .nick")
        .text()
        .trim();
      author = new Author(
        ginfo_area.text().replace("(", "").replace(")", "").trim(),
        authorName,
        false,
        false,
        false,
        false,
      );
    }

    let contents = convert(content.html()!, {
      selectors: [{ selector: "img", format: "skip" }],
    });

    const images: Image[] = [];

    content
      .find("img")
      .toArray()
      .forEach((element) => {
        const src = element.attribs["data-original"];
        images.push(new Image(src, this.documentId, this.boardId, this.client));
      });
    const viewCount = 0;
    // const viewCount = parseInt(
    //   gallView_ginfo[0].children[0].data.split(" ").pop(),
    // );
    const time = new Date();
    // const time = parseTime(header_ginfo[1].children[0].data);
    const voteupCount = parseInt(ctBox.find("#recomm_btn.ct").text());
    const votedownCount = 0;
    const loginedVoteupCount = parseInt(
      ctBox.find("#recomm_btn_member.num").text(),
    );

    return new Document(
      this.client,
      this.documentId,
      this.boardId,
      title,
      subject,
      author!,
      time,
      viewCount,
      voteupCount,
      votedownCount,
      loginedVoteupCount,
      contents,
      images,
      content.html()!.trim(),
      [],
    );
  }
}
