import { Client } from "../dist/index.js";

let client = new Client();

const list = [
  "🔓그래!",
  "🔥핫딜",
  "📦거래",
  "💰거래",
  "🔥购物节",
  "🐟闲鱼",
  "🛃거래",
];

let init = 40;

client.on("task", (name) => {
  console.log("작업 시작 :", name);
});
client.on("warn", (msg) => {
  console.log(msg);
});
client.on("update", async (data) => {
  if (init > 0) {
    init -= 1;
    return;
  }
  const webhooks = [
    "https://discord.com/api/webhooks/1477584174545109153/EpwnB-hLj-3RkLr-iXoQTTEmOVz97EONCJJrQG_Y6RaPyeBtgKMVF3hGQ4ZLDTr4n-9F",
  ];

  function embed(document) {
    const timestamp = client.util
      .moment(document.time)
      .format("YYYY-MM-DD HH:mm:ss");
    return {
      title: `${document.subject} - ${document.title}`,
      description: document.contents,
      fields: [
        {
          name: data.boardId,
          value: `[글로 이동](https://ohurjon.moe/dcinside?id=${document.boardId}&no=${document.id})`,
        },
      ],
      footer: {
        text: `${data.author.name}(${data.author.id}) - ${timestamp}`,
      },
    };
  }

  const payload = {
    username: "DCInside Watcher",
    avatar_url: "https://i.imgur.com/4M34hi2.png",
    embeds: [embed(data.document)],
  };

  for (const webhook of webhooks) {
    fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
});

await client.watch("minipc", 1);
