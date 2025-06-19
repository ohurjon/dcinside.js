import { IConverter } from "../Converter.js";

import * as cheerio from "cheerio";

import { Gallery, Client } from "../../index.js";

export class GalleryListConverter implements IConverter {
  client: Client;
  constructor(client: Client) {
    this.client = client;
  }
  convert(html: string): Map<string, Gallery> {
    let galleryList: Map<string, Gallery> = new Map();

    let $ = cheerio.load(html);
    let data = $(".gall-lst li a");

    data.each((_, element) => {
      const boardName = $(element).text();
      const boardUrl = $(element).attr("href")!;
      const boardId = boardUrl.split("/").pop()!;
      galleryList.set(boardId, new Gallery(boardId, boardName, boardUrl));
    });

    return galleryList;
  }
}
