const { Client } = require("dcinside.js");

let client = new Client();

client.on("ready", () => {
  console.log("준비 완료!");
});

client.on("update", (data) => {
  console.log(data.toString());
});

client.watch("sff", 500);
