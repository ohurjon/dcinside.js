import { Client, Document, DocumentIndex } from "../dist/index.js";

let client = new Client();

// client.on("task", (info) => {
//   console.log(info);
// });

// client.on("debug", (info) => {
//   console.debug(info);
// });

// client.on("verbose", (info) => {
//   console.log(info);
// });

let d = 0;

client.document("sff", 1594632).then((doc) => {
  console.log(doc);
});

client.board("sff").then((board) => {
  console.log(board);
});

// client.on("update", async (data) => {
//   console.log(data.toString());
//   const doc = await data.document();
// });

// client.watch("sff", 5);
