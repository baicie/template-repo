import { execSync } from "child_process";

function getFormattedDateTime() {
  const now = new Date();

  // 格式化为 "YYYY-MM-DD HH:mm:ss"
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

try {
  // 获取格式化的时间戳
  const timestamp = getFormattedDateTime();

  // 执行 git add .
  execSync("git add .", { stdio: "inherit" });

  // 执行 git commit
  execSync(`git commit -m "auto commit: ${timestamp}"`, { stdio: "inherit" });

  console.log("Successfully committed with timestamp:", timestamp);
} catch (error) {
  console.error("Error during git commit:", error.message);
  process.exit(1);
}
