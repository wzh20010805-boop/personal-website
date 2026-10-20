"use client";

import { useEffect } from "react";
import { publicAsset } from "@/lib/public-assets";

const destination = publicAsset("/agents/personal-knowledge/");

export default function KnowledgeMovedPage() {
  useEffect(() => { window.location.replace(destination); }, []);
  return <main className="page-shell category-page"><h1>个人知识库已移至 Agent 分类</h1><p><a href={destination}>前往个人知识库项目介绍 →</a></p></main>;
}
