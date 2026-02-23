declare const Bun: any;

async function main() {
  const glob = new Bun.Glob("dishes/**/*.md");
  const mdFiles: string[] = [];

  for await (const relativePath of glob.scan(".")) {
    mdFiles.push(relativePath);
  }

  mdFiles.sort((a, b) => a.localeCompare(b, "zh-CN"));

  for (const relativePath of mdFiles) {
    console.log(relativePath);
  }

  console.log(`\nTotal .md files: ${mdFiles.length}`);
}

main().catch((error) => {
  console.error("Failed to list .md files:", error);
  Bun.exit(1);
});
