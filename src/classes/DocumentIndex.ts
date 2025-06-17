/**
 * 갤러리의 글 리스트의 간단한 정보가 담겨있는 클래스 입니다.
 *
 * @module DocumentIndex
 * @class DocumentIndex
 * @property {number} id - 글의 ID
 * @property {string} boardId - 갤러리 ID
 * @property {string} type - 글의 타입 (txt, img, play 등)
 * @property {boolean} recommend - 추천 여부
 * @property {string} title - 글의 제목
 * @property {string} subject - 글의 주제
 * @property {Object} author - 글 작성자 정보
 * @property {string} author.name - 작성자 이름
 * @property {string} author.id - 작성자 ID
 * @property {Date} time - 글 작성 시간
 * @property {number} viewCount - 조회수
 * @property {number} voteupCount - 추천 수
 * @property {number} commentCount - 댓글 수
 * @property {function} document - 글의 상세 정보를 가져오는 함수
 * @property {function} comments - 글의 댓글 정보를 가져오는 함수

 */

import { Author, Document, Comment } from "../index.js";

export class DocumentIndex {
  id: number;
  boardId: string;
  type: string;
  recommend: boolean;
  title: string;
  subject: string;
  author: Author;
  time: Date;
  viewCount: number;
  voteupCount: number;
  commentCount: number;
  document: Promise<Document>;
  comments: Promise<Comment[]>;

  constructor(
    id: number,
    boardId: string,
    type: string,
    recommend: boolean,
    title: string,
    subject: string,
    author: Author,
    time: Date,
    viewCount: number,
    voteupCount: number,
    commentCount: number,
    document: Promise<Document>,
    comments: Promise<Comment[]>
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
