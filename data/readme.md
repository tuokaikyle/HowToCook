process the data for only one directory: 
dishes

in dishes directory, if run `tree -L 1` then I get: 
.
├── aquatic
├── breakfast
├── condiment
├── dessert
├── drink
├── meat_dish
├── semi-finished
├── soup
├── staple
├── template
└── vegetable_dish

in dishes directory, if run `tree` then I get: 
├── aquatic
│   ├── 小龙虾
│   │   ├── 成品.jpg
│   │   └── 小龙虾.md
│   ├── 白灼虾
│   │   ├── 白灼虾.md
│   │   └── 白灼虾.webp
│   ├── 蒜蓉虾
│   │   ├── 1.jpeg
│   │   ├── 2.jpeg
│   │   └── 蒜蓉虾.md
│   ├── 蛏抱蛋
│   │   ├── 1.jpeg
│   │   ├── 2.jpeg
│   │   ├── 3.jpeg
│   │   └── 蛏抱蛋.md
│   ├── 水煮鱼.md
│   ├── 红烧鱼.md
│   ├── 肉蟹煲.md
│   ├── 酱炖蟹.md


you can see there are a lot of .md files, and a lot of directories. each directory contains one .md file. you can ignore other types of files. 

in get-basic-info.ts, can you write a script, to list all the relative paths of the .md files and count how many .md files are there?

In data/process-markdown-recipes.ts, I am hoping to read the .md files. however, there are some errors in it. also, I hope to add a few requirements: 
1. read all the .md files, just like the script in data/get-basic-info.ts. 
2. reading one md file should produce a .json file in the data/result directory. the name of the json file should be the same as the .md file.
3. the json file should be a big array of objects, each object must also have id, category, and other keys that are already defined in type Recipe 
4. id should be integers, category should be the folder names, like aquatic or breakfast
5. please note the lines in ## 必备原料和工具 section may start with a - sign or a * sign. 

id should be incremental based the initial pinyin of the first character of the title
the lines under ## should be all simple lines, and ### should not be specially treated. 
·## 附加内容· should also be added to json files
regarding `## 计算`, calculations should have two keys. if a line starts with - or *, then append this line to the quantity: [string, string...]. else if this line is longer than 5 characters, append this line to note: [string, string...]

If using this script to process dishes/meat_dish/酱牛肉/酱牛肉.md, then this line "家常酱牛肉营养丰富，味道香，不论是当作主食还是佐餐都很棒。一般初学者只需要 10 小时即可完成。" will be skipped. I hope to add such line to the description key of the json file. description can be an array of strings

use md library
ingredients should be: {name: string, quantity: number, unit: string}
index the steps and image