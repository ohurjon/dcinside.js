"use strict";

class Document {
  constructor(
    id,
    boardId,
    title,
    subject = null,
    author,
    time,
    viewCount,
    voteupCount,
    votedownCount,
    loginedVoteupCount,
    contents,
    images,
    html,
    comments
  ) {
    this.id = id;
    this.boardId = boardId;
    this.title = title;
    this.subject = subject;
    this.author = author;
    this.time = time instanceof Date ? time : new Date(time);
    this.viewCount = viewCount;
    this.voteupCount = voteupCount;
    this.votedownCount = votedownCount;
    this.loginedVoteupCount = loginedVoteupCount;
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

exports.Document = Document;
