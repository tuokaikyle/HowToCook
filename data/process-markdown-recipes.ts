export {};

const BunApi = (globalThis as any).Bun;

type Recipe = {
  id: number;
  category: string;
  file: string;
  title: string;
  description: string[];
  images?: string[];
  difficulty?: string;
  ingredients: string[];
  calculations: {
    quantity: string[];
    note: string[];
  };
  steps: string[];
  additionalContent: string[];
};

function normalizeSectionLine(line: string): { text: string; isBullet: boolean } {
  const bulletMatch = line.match(/^[-*]\s*(.*)$/);
  if (bulletMatch) {
    return { text: bulletMatch[1].trim(), isBullet: true };
  }
  return { text: line.trim(), isBullet: false };
}

function parseRecipe(md: string, file: string): Recipe {
  const lines = md.split("\n").map((l) => l.trimEnd());
  const pathParts = file.split("/");
  const category = pathParts[1] ?? "unknown";

  let title = "";
  const description: string[] = [];
  let difficulty = "";
  const ingredients: string[] = [];
  const images: string[] = [];
  const calculations = {
    quantity: [] as string[],
    note: [] as string[],
  };
  const steps: string[] = [];
  const additionalContent: string[] = [];

  let section = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("# ")) {
      title = line.replace(/^#\s+/, "").replace(/的做法$/, "");
      continue;
    }

    if (line.startsWith("![")) {
      images.push(line);
      continue;
    }

    if (line.startsWith("预估烹饪难度：")) {
      difficulty = line.replace("预估烹饪难度：", "").trim();
      continue;
    }

    if (line.startsWith("## ")) {
      section = line.replace(/^##\s+/, "").trim();
      continue;
    }

    // ### 不分层，作为普通文本追加到当前 ## 段落
    if (line.startsWith("### ")) {
      const headingText = line.replace(/^###\s+/, "").trim();
      if (!headingText) continue;

      if (section === "操作") {
        steps.push(headingText);
      } else if (section === "附加内容") {
        additionalContent.push(headingText);
      }
      continue;
    }

    const { text, isBullet } = normalizeSectionLine(line);
    if (!text) continue;

    if (section === "必备原料和工具") {
      ingredients.push(text);
      continue;
    }

    if (section === "计算") {
      if (isBullet) {
        calculations.quantity.push(text);
      } else if (text.length > 5) {
        calculations.note.push(text);
      }
      continue;
    }

    if (section === "操作") {
      steps.push(text);
      continue;
    }

    if (section === "附加内容") {
      additionalContent.push(text);
      continue;
    }

    // 在第一个 ## 章节之前，收集普通文本行为 description
    if (!section && !line.startsWith("![") && !line.startsWith("### ")) {
      description.push(line);
    }
  }

  return {
    id: 0,
    category,
    file,
    title,
    description,
    images: images.length > 0 ? images : undefined,
    difficulty: difficulty || undefined,
    ingredients,
    calculations,
    steps,
    additionalContent,
  };
}

async function main() {
  const glob = new BunApi.Glob("dishes/**/*.md");
  const mdFiles: string[] = [];

  for await (const file of glob.scan(".")) {
    mdFiles.push(file);
  }

  mdFiles.sort((a, b) => a.localeCompare(b, "zh-CN"));
  await BunApi.$`mkdir -p data/result`;

  const recipes: Recipe[] = [];
  for (const file of mdFiles) {
    const text = await BunApi.file(file).text();
    recipes.push(parseRecipe(text, file));
  }

  // 按标题首字拼音顺序分配递增 id（整数）
  recipes.sort((a, b) => {
    const aInitial = a.title[0] ?? "";
    const bInitial = b.title[0] ?? "";
    const initialCompare = aInitial.localeCompare(bInitial, "zh-Hans-u-co-pinyin");
    if (initialCompare !== 0) return initialCompare;

    const titleCompare = a.title.localeCompare(b.title, "zh-Hans-u-co-pinyin");
    if (titleCompare !== 0) return titleCompare;

    return a.file.localeCompare(b.file, "zh-CN");
  });

  for (let index = 0; index < recipes.length; index++) {
    const recipe = recipes[index];
    recipe.id = index + 1;

    const outputName = `${recipe.file.split("/").pop()?.replace(/\.md$/i, "") ?? `recipe-${index + 1}`}.json`;
    const outputPath = `data/result/${outputName}`;

    // 每个 .md 输出一个同名 .json，内容为数组（当前数组仅包含该菜谱对象）
    await BunApi.write(outputPath, `${JSON.stringify([recipe], null, 2)}\n`);
  }

  console.log(`Processed ${recipes.length} .md files -> data/result/*.json`);
}

main().catch((err) => {
  console.error("Failed to process markdown recipes:", err);
  BunApi.exit(1);
});
