import { Author } from "../index.js";

export class Comment {
  id: string;
  isReply: boolean;
  author: Author;
  contents: string;
  dccon: string;
  voice: string;
  time: Date;

  constructor(
    id: string,
    isReply: boolean,
    author: Author,
    contents: string,
    dccon: string,
    voice: string,
    time: Date
  ) {
    this.id = id;
    this.isReply = isReply;
    this.author = author;
    this.contents = contents;
    this.dccon = dccon;
    this.voice = voice;
    this.time = time;
  }

  toString() {
    return `ㄴ${this.isReply ? "ㄴ" : ""} ${this.author}: ${this.contents}${
      this.dccon
    }${this.voice} | ${this.time.toISOString()}`;
  }
}
