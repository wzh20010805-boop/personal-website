"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { categories, type CategoryId } from "@/data/categories";
import { publicAsset } from "@/lib/public-assets";
import type { CreatorSceneController, CreatorView } from "@/lib/creator-scene";
import styles from "./CreatorScene.module.css";

const labels: Record<CategoryId, { text: string; x: number; y: number; color: string }> = {
  prompts: { text: "PROMPTS", x: 20, y: 15, color: "#ffadc5" },
  tools: { text: "LITTLE TOOLS", x: 50, y: 9, color: "#70d390" },
  games: { text: "MINI GAMES", x: 81, y: 17, color: "#bf8aee" },
  skills: { text: "SKILLS", x: 17, y: 57, color: "#ffe580" },
  agents: { text: "AGENTS", x: 83, y: 54, color: "#ff9b75" },
  learning: { text: "LEARNING NOTES", x: 83, y: 76, color: "#69dcec" },
};
const compactLabels: Record<CategoryId, string> = { prompts: "PROMPTS", tools: "TOOLS", games: "GAMES", skills: "SKILLS", agents: "AGENTS", learning: "NOTES" };
const inspectionViews: { id: Exclude<CreatorView, "free">; label: string }[] = [
  { id: "front", label: "正面" }, { id: "left", label: "左侧" }, { id: "right", label: "右侧" },
  { id: "back", label: "背面" }, { id: "top", label: "顶部" }, { id: "bottom", label: "底部" },
];

export function CreatorScene() {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const controller = useRef<CreatorSceneController | null>(null);
  const links = useRef(new Map<CategoryId, HTMLAnchorElement>());
  const [state, setState] = useState<"loading" | "ready" | "fallback">("loading");
  const [hovered, setHovered] = useState<CategoryId | null>(null);
  const [activating, setActivating] = useState<CategoryId | null>(null);
  const [view, setView] = useState<CreatorView>("free");
  const [backdropVisible, setBackdropVisible] = useState(true);
  const helpId = useId();

  useEffect(() => {
    let cancelled = false;
    let current: CreatorSceneController | undefined;
    let layoutFrame = 0;
    let placeLabels = () => {};
    const scheduleLabels = () => {
      if (layoutFrame || cancelled) return;
      layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; placeLabels(); });
    };
    window.addEventListener("scroll", scheduleLabels, { passive: true, capture: true });
    window.addEventListener("resize", scheduleLabels, { passive: true });
    import("@/lib/creator-scene").then(({ createCreatorScene }) => {
      if (cancelled || !canvas.current) return;
      current = createCreatorScene(canvas.current, {
        project(points, protectedAreas) {
          placeLabels = () => {
          const surface = canvas.current;
          if (!surface) return;
          const width = surface.clientWidth;
          const height = surface.clientHeight;
          const badgeRight = (badge.current?.offsetLeft ?? 0) + (badge.current?.offsetWidth ?? 0);
          const badgeBottom = (badge.current?.offsetTop ?? 0) + (badge.current?.offsetHeight ?? 0);
          // Read all label sizes before writing positions to avoid layout thrashing.
          const positions = points.flatMap((point) => {
            const link = links.current.get(point.id);
            if (!link) return [];
            const w = link.offsetWidth;
            const h = link.offsetHeight;
            const x = Math.min(width - w / 2 - 8, Math.max(w / 2 + 8, point.x));
            return [{ link, w, h, x, y: Math.min(height - h / 2 - 8, Math.max(h / 2 + 8, point.y)) }];
          }).sort((a, b) => a.y - b.y);
          // Place each label nearest its object while keeping the cat's face,
          // laptop, badge and other labels clear. Recalculated only on view changes.
          const occupied = [{ left: 0, top: 0, right: badgeRight, bottom: badgeBottom }, ...protectedAreas];
          // The companion recall button is fixed to the viewport. Reserve its
          // actual intersection after scrolling, without redrawing the 3D scene.
          const recall = document.querySelector<HTMLElement>("[data-companion-recall]")?.getBoundingClientRect();
          const viewport = surface.getBoundingClientRect();
          if (recall && recall.left < viewport.right && recall.right > viewport.left && recall.top < viewport.bottom && recall.bottom > viewport.top) {
            occupied.push({ left: recall.left - viewport.left, right: recall.right - viewport.left, top: recall.top - viewport.top, bottom: recall.bottom - viewport.top });
          }
          for (const position of positions) {
            const { w, h } = position;
            const xs = [position.x, w / 2 + 8, width - w / 2 - 8];
            const ys = [position.y, h / 2 + 8, height - h / 2 - 8];
            for (const bounds of occupied) {
              xs.push(bounds.left - w / 2 - 8, bounds.right + w / 2 + 8);
              ys.push(bounds.top - h / 2 - 8, bounds.bottom + h / 2 + 8);
            }
            let nearest = Infinity;
            let best = { x: position.x, y: position.y };
            for (const x of xs) for (const y of ys) {
              if (x < w / 2 + 6 || x > width - w / 2 - 6 || y < h / 2 + 6 || y > height - h / 2 - 6) continue;
              if (occupied.some((b) => x + w / 2 + 5 > b.left && x - w / 2 - 5 < b.right && y + h / 2 + 5 > b.top && y - h / 2 - 5 < b.bottom)) continue;
              const distance = (x - position.x) ** 2 + (y - position.y) ** 2;
              if (distance < nearest) { nearest = distance; best = { x, y }; }
            }
            position.x = best.x;
            position.y = best.y;
            occupied.push({ left: best.x - w / 2, right: best.x + w / 2, top: best.y - h / 2, bottom: best.y + h / 2 });
            position.link.style.left = `${position.x}px`;
            position.link.style.top = `${position.y}px`;
          }
          };
          placeLabels();
        },
        hover: setHovered,
        activate: setActivating,
        view: setView,
        navigate(id) { router.push(categories.find((category) => category.id === id)!.href); },
        unavailable() { if (!cancelled) setState("fallback"); },
      });
      controller.current = current;
      setState("ready");
    }).catch(() => { if (!cancelled) setState("fallback"); });
    return () => {
      cancelled = true;
      cancelAnimationFrame(layoutFrame);
      window.removeEventListener("scroll", scheduleLabels, true);
      window.removeEventListener("resize", scheduleLabels);
      current?.destroy();
      controller.current = null;
    };
  }, [router]);

  const onKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const scene = controller.current;
    if (!scene || state !== "ready") return;
    switch (event.key) {
      case "ArrowLeft": scene.rotate(0.25, 0); break;
      case "ArrowRight": scene.rotate(-0.25, 0); break;
      case "ArrowUp": scene.rotate(0, 0.15); break;
      case "ArrowDown": scene.rotate(0, -0.15); break;
      case "+": case "=": scene.zoom(1); break;
      case "-": scene.zoom(-1); break;
      case "Home": scene.reset(); break;
      default: return;
    }
    event.preventDefault();
  };

  const category = categories.find((item) => item.id === hovered);
  return (
    <figure className={styles.scene} aria-label="可交互的 3D 创作角" data-creator-scene data-scene-state={state} data-scene-view={view}>
      <div className={styles.stage}>
        <span ref={badge} className={styles.badge}><span aria-hidden="true">✳</span> 3D 创作角</span>
        <Image className={styles.poster} src={publicAsset("/illustrations/creator-hero-v2.png")}
          alt="蓝灰猫抱着电脑坐在黄色沙发上，身旁蜷着小黑猫，周围是六类创作物件。"
          width={1312} height={1199} unoptimized loading="eager" aria-hidden={state === "ready"} />
        <canvas ref={canvas} className={styles.canvas} tabIndex={state === "ready" ? 0 : -1}
          aria-label="旋转创作角：方向键旋转，加减号缩放，Home 键复位" aria-describedby={helpId} onKeyDown={onKeyDown} />
        {categories.map((item) => (
          <Link key={item.id} href={item.href} prefetch={false} className={styles.label}
            aria-label={item.title} data-scene-category={item.id} data-active={hovered === item.id} data-activating={activating === item.id}
            ref={(element) => { if (element) links.current.set(item.id, element); else links.current.delete(item.id); }}
            style={{ left: `${labels[item.id].x}%`, top: `${labels[item.id].y}%`, boxShadow: `2px 3px 0 ${labels[item.id].color}` }}
            onPointerEnter={() => controller.current?.highlight(item.id)} onPointerLeave={() => { controller.current?.press(null); controller.current?.highlight(null); }}
            onPointerDown={(event) => { if (event.button === 0) controller.current?.press(item.id); }}
            onPointerUp={() => controller.current?.press(null)} onPointerCancel={() => controller.current?.press(null)}
            onKeyDown={(event) => { if (event.key === "Enter") controller.current?.press(item.id); }}
            onKeyUp={() => controller.current?.press(null)}
            onClick={(event) => {
              if (state !== "ready" || !controller.current || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              controller.current.activate(item.id);
            }}
            onFocus={() => controller.current?.highlight(item.id)} onBlur={() => { controller.current?.press(null); controller.current?.highlight(null); }}>
            <span className={styles.fullLabel}>{labels[item.id].text}</span><span className={styles.compactLabel}>{compactLabels[item.id]}</span><span className={styles.arrow} aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <figcaption className={styles.caption}>
        <div className={styles.hint} id={helpId}>
          <strong>{view !== "free" ? `${inspectionViews.find(item => item.id === view)?.label} · 正交视图` : category ? category.note : "把好奇心转个方向"}</strong>
          <span>{state === "ready" ? view !== "free" ? "同一模型 · 拖动可继续环绕观察" : "拖动旋转 · 点击物件探索" : state === "loading" ? "正在打开创作角…" : "点击标签，探索我的创作"}</span>
        </div>
        <div className={styles.controls} aria-label="场景视角" hidden={state === "fallback"}>
          <button type="button" aria-label="缩小场景" title="缩小场景" disabled={state !== "ready"} onClick={() => controller.current?.zoom(-1)}>−</button>
          <button type="button" aria-label="重置视角" title="重置视角" disabled={state !== "ready"} onClick={() => controller.current?.reset()}>↺</button>
          <button type="button" aria-label="放大场景" title="放大场景" disabled={state !== "ready"} onClick={() => controller.current?.zoom(1)}>＋</button>
        </div>
      </figcaption>
      {state === "ready" && <details className={styles.inspection}>
        <summary>六视图检查</summary>
        <div className={styles.viewButtons} role="group" aria-label="六视图">
          {inspectionViews.map(item => <button key={item.id} type="button" data-view-button={item.id} aria-pressed={view === item.id}
            onClick={() => controller.current?.setView(item.id)}>{item.label}</button>)}
        </div>
        <label className={styles.backdropToggle}><input type="checkbox" checked={backdropVisible} onChange={event => {
          setBackdropVisible(event.target.checked); controller.current?.setBackdrop(event.target.checked);
        }} />显示粉色背板</label>
        <p>背板保持固定，会真实遮挡背面；关闭后可检查角色背部。</p>
      </details>}
      {state === "ready" && view !== "free" && <nav className={styles.inspectionLinks} aria-label="创作角功能入口">
        {categories.map(item => <Link key={item.id} href={item.href} prefetch={false}>{compactLabels[item.id]} ↗</Link>)}
      </nav>}
    </figure>
  );
}
