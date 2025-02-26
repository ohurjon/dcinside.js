"use strict";

class Image {
  constructor(src, documentId, boardId, session) {
    this.src = src;
    this.documentId = documentId;
    this.boardId = boardId;
    this.session = session;
  }
  async load() {
    const headers = { ...GET_HEADERS }; // 기존 헤더 복사
    headers[
      "Referer"
    ] = `https://m.dcinside.com/board/${this.boardId}/${this.documentId}`;

    try {
      const response = await this.session.get(this.src, {
        headers: headers,
        withCredentials: true, // 쿠키 포함 (fetch 사용 시 필요)
      });
      return response.data;
    } catch (error) {
      console.error("Error loading data:", error);
      throw error;
    }
  }

  async download(path) {
    //TODO
    throw "Not implemented";
    // const headers = { ...GET_HEADERS }; // 기존 헤더 복사
    // headers[
    //   "Referer"
    // ] = `https://m.dcinside.com/board/${this.boardId}/${this.documentId}`;

    // try {
    //   const response = await this.session.get(this.src, {
    //     headers: headers,
    //     responseType: "arraybuffer", // 바이너리 데이터 받기
    //     withCredentials: true, // 쿠키 포함 (필요할 경우)
    //   });

    //   const bytes = response.data;
    //   const type = await fileType.fromBuffer(bytes);
    //   const ext = type ? type.ext : "bin"; // 확장자 추론 실패 시 "bin"

    //   const filePath = `${path}.${ext}`;
    //   await fs.writeFile(filePath, bytes);

    //   console.log(`File saved as: ${filePath}`);
    // } catch (error) {
    //   console.error("Download failed:", error);
    // }
  }
}

exports.Image = Image;
