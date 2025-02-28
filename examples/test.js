const { Client } = require("dcinside.js");

let client = new Client();

client.on("ready", () => {
  console.log("준비 완료!");
});

client.on("update", (data) => {
  data.document().then((doc) => {
    console.log(doc.toString());
  });
});

// client.watch("sff", 3000);
client.watch("sff", 3000);
