"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const destination = "/agents/personal-knowledge/";

export default function KnowledgeMovedPage() {
  const router = useRouter();
  useEffect(() => { router.replace(destination); }, [router]);
  return <main className="page-shell category-page"><h1>个人知识库已移至 Agent 分类</h1><p><Link href={destination}>前往个人知识库项目介绍 →</Link></p></main>;
}
