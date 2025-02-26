"use strict";

class DocumentIndex {
  constructor(
    id,
    boardId,
    type,
    recommend,
    title,
    subject,
    author,
    time,
    viewCount,
    voteupCount,
    commentCount,
    document,
    comments
  ) {
    this.id = id;
    this.boardId = boardId;
    this.type = type;
    this.recommend = recommend;
    this.title = title;
    this.subject = subject;
    this.author = author;
    this.time = time;
    this.viewCount = viewCount;
    this.voteupCount = voteupCount;
    this.commentCount = commentCount;
    this.document = document;
    this.comments = comments;
  }

  toString() {
    return `${this.subject}\t|${this.id}\t|${this.time.toLocaleString()}\t|${
      this.author.name
    }(${this.author.id})\t|${this.title}(${this.commentCount}) +${
      this.voteupCount
    }`;
  }
}

exports.DocumentIndex = DocumentIndex;
