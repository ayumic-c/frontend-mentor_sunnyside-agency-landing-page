import { defineConfig } from "vite";

// 複数のhtmlファイルを自動生成
import { resolve } from "path";
import fs from "fs";
import path from "path";

const files = [];
function readDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);

    if (fs.statSync(itemPath).isDirectory()) {
      readDirectory(itemPath);
    } else {
      // htmlファイル以外を除外する
      if (path.extname(itemPath) !== ".html") {
        continue;
      }

      // nameを決定する
      let name;
      if (dirPath === path.resolve(__dirname, "src")) {
        name = path.parse(itemPath).name;
      } else {
        const relativePath = path.relative(
          path.resolve(__dirname, "src"),
          dirPath
        );
        const dirName = relativePath.replace(/\//g, "_");
        name = `${dirName}_${path.parse(itemPath).name}`;
      }

      // pathを決定する
      const relativePath = path.relative(
        path.resolve(__dirname, "src"),
        itemPath
      );
      const filePath = `/${relativePath}`;
      files.push({ name, path: filePath });
    }
  }
}
readDirectory(path.resolve(__dirname, "src"));
const inputFiles = {};
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  inputFiles[file.name] = resolve(__dirname, "./src" + file.path);
}

export default defineConfig({
  root: "./src",
  base: "./",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: inputFiles,
      output: {
        entryFileNames: "assets/js/[name].js",
        chunkFileNames: "assets/js/[name].js",
        assetFileNames: (assetInfo) => {
          if (/\.( gif|jpeg|jpg|png|svg|webp| )$/.test(assetInfo.name)) {
            return "assets/img/[name].[ext]";
          }
          if (/\.css$/.test(assetInfo.name)) {
            return "assets/css/[name].[ext]";
          }
          return "assets/[name].[ext]";
        },
      },
    },
  },
});