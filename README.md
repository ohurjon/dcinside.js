# dcinside.js

eunchul님의 [dcinside-python3-api](https://github.com/eunchuldev/dcinside-python3-api)와 [discord.js](https://github.com/discordjs/discord.js)를 참고하여 개발하였습니다.

### JavaScript용 치명적이고 단순한 비공식 비동기 dcinside API

Deadly simple non official async dcinside api for JavaScripts

```js
// 갤러리 글 무한 크롤링
const { Client } = require("discord.js");

let client = new Client();

client.on("ready", () => {
  console.log("준비 완료!");
});

client.on("update", (data) => {
  console.log(data.toString());
});

client.watch("sff", 500);
```

# Dependency

webpack, axios, cheerio, html-to-text

# Features

- [x] Board Update Event
- [x] Board crawling
- [x] Fetch document body
- [x] Fetch document images
- [ ] Fetch comments
- [ ] Write/Modify/Delete document
- [ ] Write comment
- [ ] Delete comment
- [ ] Login/Logout
- [ ] Upvote/Downvote

기능은 앞으로 추가 에정입니다.

# Usage

install via npm

```
npm install dcinside.js
```

```js
const { Client } = require("dcinside.js");

let client = new Client();

client.board("sff", 5).then(async (data) => {
  data.length; // => 5

  data.forEach(async (index) => {
    index.id; // => 1234841
    index.boardId; // => sff
    index.type; // => text
    index.title; // => "업무용콤퓨타로 데미니 뽑는 회사도 있네"
    index.author; // => { name: 'ㅇㅇ', id: '121.144' },
    index.time; // => 2025-02-26T17:08:00.000Z (UTC)
    index.view_count; // => 104
    index.voteup_count; // => 0
    index.comment_count; // => 2

    doc = await index.document();

    doc.id; // => 1234841
    doc.board_id; // => "sff"
    doc.title; // => "업무용콤퓨타로 데미니 뽑는 회사도 있네"
    doc.author; // => { name: 'ㅇㅇ', id: '121.144' }
    doc.time; // => 2025-02-26T17:08:00.000Z (UTC)
    doc.viewCount; // => 110
    doc.voteupCount; // => 0
    doc.commentCount; // => 3
    doc.votedownCount; // => 0
    doc.loginedVoteupCount; // => 0
    doc.contents; // => '자리마다 쫙 깔아놨..'
    doc.html; // => "자리마다 쫙 깔아놨더라<div><br></div>..."

    doc.images.forEach(async (image) => {
      image.src; // => "https://..."
      image.document_id; // => 1234841
      image.board_id; // => "sff"
      await image.load(); // => raw image binary
    });
  });
});
```
