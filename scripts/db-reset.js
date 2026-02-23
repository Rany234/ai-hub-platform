const { setupEnv, printDbInfo } = require("./utils");
setupEnv();
printDbInfo();

const readline = require("readline");
const { spawn } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const warning = `\n【危险操作】即将执行 prisma migrate reset\n\n这将：\n- 清空本地数据库的所有表与数据\n- 包括用户账号、身份(role)、任务、投标等全部内容\n\n如果你只是想同步 schema，请优先使用：\n- npx prisma migrate dev\n- npx prisma generate\n\n确认继续请输入：YES\n`; 

rl.question(warning, (answer) => {
  rl.close();

  if (answer !== "YES") {
    console.log("已取消。未执行任何数据库重置操作。\n");
    process.exit(0);
  }

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["prisma", "migrate", "reset"],
    { stdio: "inherit" }
  );

  child.on("exit", (code) => process.exit(code ?? 0));
});
