class Comment {
  constructor(id, isReply, author, authorId, contents, dccon, voice, time) {
    this.id = id;
    this.isReply = isReply;
    this.author = author;
    this.authorId = authorId;
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
