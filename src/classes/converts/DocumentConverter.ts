// import { Author, Client, Document, Image } from "../../index.js";
// import { IConverter } from "../Converter.js";

// import * as cheerio from "cheerio";

// import { convert } from "html-to-text";

// export class DocumentConverter implements IConverter {
//   client: Client;
//   documentId: number;
//   boardId: string;
//   constructor(client: Client, documentId: number, boardId: string) {
//     this.client = client;
//     this.documentId = documentId;
//     this.boardId = boardId;
//   }

//   parseSubject(text: string): string | null {
//     const match = text.match(/\[(.*?)\]/); // 첫 번째 대괄호 안의 내용 추출
//     return match ? match[1] : null; // 매칭된 값이 있으면 반환, 없으면 null
//   }

//   parseTitle(text: string): string {
//     return text.replace(/^\[.*?\]\s*/, ""); // 첫 번째 []와 뒤 공백 제거
//   }

//   convert(html: string): Document {
//     let $ = cheerio.load(html);

//     $(".adv-groupno").remove();

//     let header = $(".gallview-tit-box");
//     let gallview = $(".gall-thum-btm-inner");
//     let content = $(".thum-txtin");

//     const fullTitle = $(header).find(".tit").text().trim();
//     const title = this.parseTitle(fullTitle);
//     const subject = this.parseSubject(fullTitle);

//     let ctBox = $(".ct-box");

//     const header_ginfo = $(header).find(".ginfo2").children();
//     const gallView_ginfo = $(gallview).find(".ginfo2").children();

//     let authorName = "ㅇㅇ";
//     let authorId = "(123.45)";

//     if (header_ginfo[0].children[0].tagName == "a") {
//       authorName = header_ginfo[0].children[0].children[0].data;
//       authorId = header_ginfo[0].children[0].attribs.href.split("/").pop();
//     } else {
//       const dbehd = header_ginfo[0].children[0].data;
//       authorName = dbehd.split("(")[0];
//       authorId = dbehd.split("(")[1].split(")")[0];
//     }

//     let contents = convert(content.html(), {
//       selectors: [{ selector: "img", format: "skip" }],
//     });

//     const images: Image[] = [];

//     content
//       .find("img")
//       .toArray()
//       .forEach((element) => {
//         const src = element.attribs["data-original"];
//         images.push(new Image(src, this.documentId, this.boardId, this.client));
//       });

//     const viewCount = parseInt(
//       gallView_ginfo[0].children[0].data.split(" ").pop()
//     );
//     const time = parseTime(header_ginfo[1].children[0].data);
//     const voteupCount = parseInt(ctBox.find("#recomm_btn.ct").text());
//     const votedownCount = 0;
//     const loginedVoteupCount = parseInt(
//       ctBox.find("#recomm_btn_member.num").text()
//     );

//     return new Document(
//       this.documentId,
//       this.boardId,
//       title,
//       subject,
//       new Author(authorId, authorName, false, false),
//       time,
//       viewCount,
//       voteupCount,
//       votedownCount,
//       loginedVoteupCount,
//       contents,
//       images,
//       content.html()!.trim(),
//       []
//     );
//   }
// }
