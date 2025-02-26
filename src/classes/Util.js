function parseTime(timeStr) {
  const now = new Date();

  if (timeStr.length <= 5) {
    if (timeStr.includes(":")) {
      // HH:mm (오늘 날짜로 설정)
      const [hours, minutes] = timeStr.split(":").map(Number);
      date = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes
      );
    } else {
      // MM.dd (올해 날짜, 23:59:59 설정)
      const [month, day] = timeStr.split(".").map(Number);
      date = new Date(now.getFullYear(), month - 1, day, 23, 59, 59);
    }
  } else if (timeStr.length <= 11) {
    if (timeStr.includes(":")) {
      // MM.dd HH:mm (올해 날짜로 설정)
      const [monthDay, time] = timeStr.split(" ");
      const [month, day] = monthDay.split(".").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      date = new Date(now.getFullYear(), month - 1, day, hours, minutes);
    } else {
      // yy.MM.dd (연도 설정, 23:59:59)
      const [year, month, day] = timeStr.split(".").map(Number);
      date = new Date(2000 + year, month - 1, day, 23, 59, 59);
    }
  } else if (timeStr.length <= 16) {
    if (timeStr.includes(".")) {
      // yyyy.MM.dd HH:mm
      const [ymd, time] = timeStr.split(" ");
      const [year, month, day] = ymd.split(".").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      date = new Date(year, month - 1, day, hours, minutes);
    } else {
      // MM.dd HH:mm:ss (올해 날짜 설정)
      const [monthDay, time] = timeStr.split(" ");
      const [month, day] = monthDay.split(".").map(Number);
      const [hours, minutes, seconds] = time.split(":").map(Number);
      date = new Date(
        now.getFullYear(),
        month - 1,
        day,
        hours,
        minutes,
        seconds
      );
    }
  } else {
    if (timeStr.includes(".")) {
      // yyyy.MM.dd HH:mm:ss
      const [ymd, time] = timeStr.split(" ");
      const [year, month, day] = ymd.split(".").map(Number);
      const [hours, minutes, seconds] = time.split(":").map(Number);
      date = new Date(year, month - 1, day, hours, minutes, seconds);
    } else {
      // yyyy-MM-dd HH:mm:ss
      const [ymd, time] = timeStr.split(" ");
      const [year, month, day] = ymd.split("-").map(Number);
      const [hours, minutes, seconds] = time.split(":").map(Number);
      date = new Date(year, month - 1, day, hours, minutes, seconds);
    }
  }

  return date;
}

function parseSubject(text) {
  const match = text.match(/\[(.*?)\]/); // 첫 번째 대괄호 안의 내용 추출
  return match ? match[1] : null; // 매칭된 값이 있으면 반환, 없으면 null
}

function parseTitle(text) {
  return text.replace(/^\[.*?\]\s*/, ""); // 첫 번째 []와 뒤 공백 제거
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function test() {
  // 테스트 실행
  console.log(parseTime("14:30").toString()); // 오늘 14:30
  console.log(parseTime("03.10").toString()); // 올해 3월 10일 23:59:59
  console.log(parseTime("03.10 14:30").toString()); // 올해 3월 10일 14:30
  console.log(parseTime("24.03.10").toString()); // 2024년 3월 10일 23:59:59
  console.log(parseTime("2024.03.10 14:30").toString()); // 2024년 3월 10일 14:30
  console.log(parseTime("2024-03-10 14:30:45").toString()); // 2024년 3월 10일 14:30:45
}

exports.parseTime = parseTime;
exports.parseSubject = parseSubject;
exports.parseTitle = parseTitle;
exports.sleep = sleep;
