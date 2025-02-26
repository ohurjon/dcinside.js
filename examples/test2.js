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
