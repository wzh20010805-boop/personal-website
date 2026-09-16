export type CategoryId = "prompts" | "tools" | "games" | "skills" | "agents" | "learning";

export interface Category {
  id: CategoryId;
  title: string;
  english: string;
  description: string;
  color: string;
  note: string;
}

export const categories: Category[] = [
  { id: "prompts", title: "我推荐的 Prompt", english: "PROMPTS", description: "让好问题，遇见好答案。\n收集值得分享的提示词与使用心得。", color: "var(--prompt)", note: "灵感从一句话开始" },
  { id: "tools", title: "我做的小工具", english: "LITTLE TOOLS", description: "给日常的小麻烦，做点小发明。\n把想法变成顺手的工具。", color: "var(--tool)", note: "小工具，大帮忙" },
  { id: "games", title: "我做的小游戏", english: "MINI GAMES", description: "认真做一点好玩的东西。\n在规则和想象之间，探索乐趣。", color: "var(--game)", note: "给好奇心留个位置" },
  { id: "skills", title: "我做的 Skill", english: "SKILLS", description: "把实用的方法，装进技能卡。\n积累可以反复使用的创作能力。", color: "var(--skill)", note: "让方法成为技能" },
  { id: "agents", title: "我做的 Agent", english: "AGENTS", description: "为一个想法，搭一位小帮手。\n记录 Agent 的设计与实践。", color: "var(--agent)", note: "和想法一起行动" },
  { id: "learning", title: "我的学习与技术积累", english: "LEARNING NOTES", description: "一边探索，一边留下脚印。\n收好学习笔记、实践与技术心得。", color: "var(--learning)", note: "保持好奇，持续生长" },
];
