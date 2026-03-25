import { Author, Image, Comment, Client } from "../index.js";

export class Document {
  client : Client;
  id: number;
  boardId: string;
  title: string;
  subject: string | null;
  author: Author;
  time: Date;
  viewCount: number;
  voteupCount: number;
  votedownCount: number;
  gonikVoteupCount: number;
  comments: Comment[];
  contents: string;
  images: Image[];
  html: string;
  constructor(
    client: Client,
    id: number,
    boardId: string,
    title: string,
    subject: string | null = null,
    author: Author,
    time: Date,
    viewCount: number,
    voteupCount: number,
    votedownCount: number,
    gonikVoteupCount: number,
    contents: string,
    images: Image[],
    html: string,
    comments: Comment[]
  ) {
    this.client = client;
    this.id = id;
    this.boardId = boardId;
    this.title = title;
    this.subject = subject;
    this.author = author;
    this.time = time instanceof Date ? time : new Date(time);
    this.viewCount = viewCount;
    this.voteupCount = voteupCount;
    this.votedownCount = votedownCount;
    this.gonikVoteupCount = gonikVoteupCount;
    this.comments = comments;
    this.contents = contents;
    this.images = images;
    this.html = html;
  }

  toString() {
    return `${this.subject || ""}\t|${
      this.id
    }\t|${this.time.toLocaleString()}\t|${this.author.name}(${
      this.author.id
    })\t|${this.title}(${this.comments.length}) +${this.voteupCount} -${
      this.votedownCount
    }\n${this.contents.replaceAll("\t", "").replaceAll("\n", "")}`;
  }
}
