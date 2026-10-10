import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { publicAsset } from "@/lib/public-assets";
import "./globals.css";

export const metadata: Metadata = {
  title: "创作空间｜独立创作者的作品展厅",
  description: "一个独立创作者的小世界：Prompt、小工具、小游戏、Skill、Agent，以及学习与技术积累。第一阶段静态视觉预览。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const style = { "--paper-grain": `url("${publicAsset("/illustrations/paper-grain.svg")}")` } as CSSProperties;
  return <html lang="zh-CN"><body style={style}>{children}</body></html>;
}
