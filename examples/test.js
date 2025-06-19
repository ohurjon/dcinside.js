import { Client } from "../dist/index.js";

let client = new Client();

client.on("ready", () => {
  console.log("준비 완료!");
});

client.on("update", (data) => {
  console.log("업데이트:", data);
});

// client.gallery().then((gallery) => {
//   console.log(gallery.length);
// });

// client.board("sff", 100).then((board) => {
//   console.log(board);
// });

// client
//   .board("sff", 200, 1, false)
//   .then((board) => {
//     console.log(board);
//   })
//   .catch((err) => {
//     console.error(err);
//   });

client.watch("sff", 3000).catch((err) => {
  console.error("감시 실패:", err);
});
