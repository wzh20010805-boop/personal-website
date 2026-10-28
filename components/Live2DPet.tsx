"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import { getPetMotion, petMotions, type PetMotionId } from "@/data/live2d-motions";
import { getPetExpression, getPetOutfit, petExpressions, petOutfits, type PetExpressionId, type PetOutfitId } from "@/data/live2d-appearance";
import type { PetBounds, PetPlayer } from "@/lib/live2d-player";
import styles from "./Live2DPet.module.css";

const storageKey = "creator-space:live2d:v1";
const preferencesEvent = "creator-space:live2d-preferences";
type Position = { right: number; bottom: number };
type Preferences = { dismissed: boolean; idle: PetMotionId; size: number; expression: PetExpressionId; outfit: PetOutfitId; position?: Position };
type MenuSection = "motions" | "expressions" | "outfits";
let memoryPreferences: string | undefined;

function readPreferences() {
  if (memoryPreferences !== undefined) return memoryPreferences;
  try { return sessionStorage.getItem(storageKey) ?? ""; }
  catch { return ""; }
}

function parsePreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw || "{}");
    const motion = getPetMotion(value.idle);
    const position = value.position;
    return {
      dismissed: value.dismissed === true,
      idle: motion.idle ? motion.id : "NaturalIdle36",
      size: Number.isFinite(value.size) ? Math.max(25, Math.min(200, value.size)) : 100,
      expression: getPetExpression(typeof value.expression === "string" ? value.expression : "neutral").id,
      outfit: getPetOutfit(typeof value.outfit === "string" ? value.outfit : "maid").id,
      position: position && Number.isFinite(position.right) && Number.isFinite(position.bottom)
        ? { right: position.right, bottom: position.bottom } : undefined,
    };
  } catch { return { dismissed: false, idle: "NaturalIdle36", size: 100, expression: "neutral", outfit: "maid" }; }
}

function savePreferences(update: Partial<Preferences>) {
  memoryPreferences = JSON.stringify({ ...parsePreferences(readPreferences()), ...update });
  try { sessionStorage.setItem(storageKey, memoryPreferences); } catch { /* The pet also works with storage disabled. */ }
  window.dispatchEvent(new Event(preferencesEvent));
}

function subscribePreferences(callback: () => void) {
  window.addEventListener(preferencesEvent, callback);
  return () => window.removeEventListener(preferencesEvent, callback);
}

const serverPreferences = () => null;

export default function Live2DPet() {
  const raw = useSyncExternalStore(subscribePreferences, readPreferences, serverPreferences);
  const preferences = useMemo(() => parsePreferences(raw), [raw]);
  if (raw === null) return null;
  if (preferences.dismissed) {
    return <button type="button" data-companion-recall className={styles.recall} onClick={() => savePreferences({ dismissed: false })}>召回伙伴 <span aria-hidden="true">✦</span></button>;
  }
  return <ActivePet preferences={preferences} />;
}

function ActivePet({ preferences }: { preferences: Preferences }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const character = useRef<HTMLButtonElement>(null);
  const player = useRef<PetPlayer | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);
  const repositionMenu = useRef<() => void>(() => undefined);
  const drag = useRef<{ pointer: number; x: number; y: number; right: number; bottom: number; moved: boolean } | null>(null);
  const [initialIdle] = useState(preferences.idle);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);
  const [motionId, setMotionId] = useState<PetMotionId>(initialIdle);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuSection, setMenuSection] = useState<MenuSection>("motions");
  const [bounds, setBounds] = useState<PetBounds>();
  const [dragPosition, setDragPosition] = useState<Position | undefined>();
  const [feedback, setFeedback] = useState("");
  const motion = getPetMotion(motionId);
  const position = dragPosition ?? preferences.position;

  useEffect(() => {
    if (!canvas.current) return;
    const element = canvas.current;
    const abort = new AbortController();
    void import("@/lib/live2d-player").then(({ createPetPlayer }) =>
      createPetPlayer(element, initialIdle, setMotionId, setBounds, abort.signal),
    ).then((controller) => {
      if (abort.signal.aborted) { controller.destroy(); return; }
      player.current = controller;
      setStatus("ready");
    }).catch((error: unknown) => {
      if (abort.signal.aborted) return;
      console.error("Live2D partner could not start", error);
      setStatus("error");
    });
    return () => {
      abort.abort();
      player.current?.destroy();
      player.current = null;
    };
  }, [initialIdle, retry]);

  useEffect(() => {
    if (status === "ready") {
      player.current?.setAppearance({ expression: preferences.expression, outfit: preferences.outfit });
    }
  }, [status, preferences.expression, preferences.outfit]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen || !panel.current || !character.current || !menuButton.current) return;
    const menu = panel.current;
    const target = character.current;
    const trigger = menuButton.current;
    const placeMenu = () => {
      // Keep the slider under the pointer until the visitor releases it.
      if (resizing.current) return;
      const box = target.getBoundingClientRect();
      const control = trigger.getBoundingClientRect();
      const width = menu.offsetWidth;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const fitsLeft = box.left >= width + 20;
      const fitsRight = viewportWidth - box.right >= width + 20;
      let left: number;
      let top: number;
      let maxHeight = viewportHeight - 24;
      if (viewportWidth > 600 && (fitsLeft || fitsRight)) {
        left = fitsLeft ? box.left - width - 8 : box.right + 8;
        const height = Math.min(menu.scrollHeight + 6, maxHeight);
        top = Math.max(12, Math.min(control.bottom - height, viewportHeight - height - 12));
      } else {
        // Leave the size slider accessible even when a large pet fills the screen.
        maxHeight = Math.max(148, box.top - 20);
        const height = Math.min(menu.scrollHeight + 6, maxHeight);
        left = Math.max(12, Math.min(control.left + control.width / 2 - width / 2, viewportWidth - width - 12));
        top = Math.max(12, box.top - height - 8);
      }
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.maxHeight = `${maxHeight}px`;
    };
    repositionMenu.current = placeMenu;
    placeMenu();
    const observer = new ResizeObserver(placeMenu);
    observer.observe(target);
    observer.observe(menu);
    window.addEventListener("resize", placeMenu);
    return () => { observer.disconnect(); window.removeEventListener("resize", placeMenu); repositionMenu.current = () => undefined; };
  }, [menuOpen, bounds, menuSection]);

  function toggleMenu() { resizing.current = false; setMenuOpen(!menuOpen); }

  function selectSection(section: MenuSection) {
    setMenuSection(section);
    panel.current?.scrollTo({ top: 0 });
  }

  function finishResize() {
    resizing.current = false;
    repositionMenu.current();
  }

  function play(id: PetMotionId) {
    setFeedback("");
    if (getPetMotion(id).idle) savePreferences({ idle: id });
    void player.current?.play(id).catch(() => setFeedback("这个动作暂时没有播放成功，再点一次试试。"));
  }

  function interact() {
    if (status === "ready") {
      const choices: PetMotionId[] = ["JoySmile6", "SoftWink4", "CuriousTilt8", "NodYes6"];
      play(choices[Math.floor(Math.random() * choices.length)]);
    }
    if (!menuOpen) toggleMenu();
  }

  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || !root.current) return;
    const box = root.current.getBoundingClientRect();
    drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, right: window.innerWidth - box.right, bottom: window.innerHeight - box.bottom, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start || start.pointer !== event.pointerId || !root.current) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 6) return;
    start.moved = true;
    setMenuOpen(false);
    const box = root.current.getBoundingClientRect();
    setDragPosition({
      right: Math.max(12, Math.min(window.innerWidth - box.width - 12, start.right - dx)),
      bottom: Math.max(12, Math.min(window.innerHeight - box.height - 12, start.bottom - dy)),
    });
  }

  function pointerUp(event: PointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    if (!start || start.pointer !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (start.moved) {
      if (root.current) {
        const box = root.current.getBoundingClientRect();
        savePreferences({ position: { right: window.innerWidth - box.right, bottom: window.innerHeight - box.bottom } });
      }
    } else if (event.currentTarget.dataset.interact === "true") interact();
  }

  const dragHandlers = {
    onPointerDown: pointerDown,
    onPointerMove: pointerMove,
    onPointerUp: pointerUp,
    onPointerCancel: () => { drag.current = null; },
  };
  const style = {
    "--pet-scale": preferences.size / 100,
    ...(position && { "--pet-right": `${position.right}px`, "--pet-bottom": `${position.bottom}px` }),
    ...(bounds && {
      "--pet-hit-left": `${bounds.left}px`, "--pet-hit-top": `${bounds.top}px`,
      "--pet-hit-width": `${bounds.width}px`, "--pet-hit-height": `${bounds.height}px`,
    }),
  } as CSSProperties;

  return (
    <section ref={root} className={styles.pet} style={style} aria-label="Live2D 网页伙伴" data-pet-status={status} data-pet-motion={motionId} data-pet-expression={preferences.expression} data-pet-outfit={preferences.outfit}>
      <div className={styles.stage}>
        <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
        <button ref={character} type="button" className={styles.character} aria-label="和网页伙伴互动，也可以拖动位置" title="点击互动，按住可拖动位置" data-interact="true" {...dragHandlers} onClick={(event) => { if (event.detail === 0) interact(); }} />
        {status !== "ready" && <span className={styles.placeholder}>{status === "loading" ? "伙伴正在赶来…" : "伙伴暂时迷路了"}</span>}
      </div>
      <div className={styles.toolbar}>
        <button type="button" className={styles.drag} aria-label="拖动伙伴" title="按住拖动位置" {...dragHandlers}><span aria-hidden="true">⠿</span></button>
        <button ref={menuButton} type="button" className={styles.menuButton} aria-expanded={menuOpen} aria-controls="live2d-interactions" onClick={toggleMenu}><span className={styles.dot} aria-hidden="true" />陪你逛逛 <span aria-hidden="true">{menuOpen ? "−" : "+"}</span></button>
      </div>
      {menuOpen && <div ref={panel} id="live2d-interactions" className={styles.panel} role="group" aria-label="伙伴互动菜单">
        <div className={styles.panelHeader}><div><span className={styles.eyebrow}>YOUR LITTLE COMPANION</span><h2>今天，也一起逛逛</h2></div><button type="button" className={styles.closeMenu} aria-label="收起互动菜单" onClick={() => { setMenuOpen(false); menuButton.current?.focus(); }}>×</button></div>
        <div className={styles.sizeControl}>
          <div className={styles.sizeLabel}><label htmlFor="live2d-size">人物大小</label><output htmlFor="live2d-size">{preferences.size}%</output><button type="button" aria-label="恢复默认大小" disabled={preferences.size === 100} onClick={() => savePreferences({ size: 100 })}>恢复默认</button></div>
          <input id="live2d-size" type="range" min="25" max="200" step="5" value={preferences.size} aria-valuetext={`${preferences.size}%`} onChange={(event) => savePreferences({ size: Number(event.currentTarget.value) })} onPointerDown={(event) => { resizing.current = true; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={finishResize} onPointerCancel={finishResize} onLostPointerCapture={finishResize} />
          <p className={styles.sizeHint}>25% — 200% · 自动适应屏幕</p>
        </div>
        <p className={styles.message} aria-live="polite">{feedback || (status === "ready" ? motion.message : status === "error" ? "连接有点小问题，点一下重试，我还在这里。" : "稍等一下，马上就能见面啦。")}</p>
        {status === "error" && <button type="button" className={styles.retry} onClick={() => { setStatus("loading"); setRetry((value) => value + 1); }}>重新加载伙伴</button>}
        <div className={styles.sections} role="group" aria-label="互动分类">
          <button type="button" aria-pressed={menuSection === "motions"} aria-controls="live2d-menu-content" onClick={() => selectSection("motions")}>动作</button>
          <button type="button" aria-pressed={menuSection === "expressions"} aria-controls="live2d-menu-content" onClick={() => selectSection("expressions")}>表情</button>
          <button type="button" aria-pressed={menuSection === "outfits"} aria-controls="live2d-menu-content" onClick={() => selectSection("outfits")}>服饰</button>
        </div>
        <div id="live2d-menu-content">
          {menuSection === "motions" && <>
            <p className={styles.groupLabel}>陪伴状态 <span>循环播放</span></p>
            <div className={styles.idleGrid}>{petMotions.filter((item) => item.idle).map((item) => <button type="button" key={item.id} data-motion={item.id} aria-pressed={preferences.idle === item.id} disabled={status !== "ready"} onClick={() => play(item.id)}>{item.label}</button>)}</div>
            <p className={styles.groupLabel}>和我互动 <span>{status === "ready" ? `正在${motion.label}` : "加载后即可互动"}</span></p>
            <div className={styles.actionGrid}>{petMotions.filter((item) => !item.idle).map((item) => <button type="button" key={item.id} data-motion={item.id} aria-pressed={motionId === item.id} disabled={status !== "ready"} onClick={() => play(item.id)}>{item.label}<span aria-hidden="true">↗</span></button>)}</div>
          </>}
          {menuSection === "expressions" && <>
            <p className={styles.groupLabel}>换个表情 <span>当前：{getPetExpression(preferences.expression).label}</span></p>
            <div className={styles.expressionGrid}>{petExpressions.map((item) => <button type="button" key={item.id} data-expression={item.id} title={item.note} aria-pressed={preferences.expression === item.id} disabled={status !== "ready"} onClick={() => { savePreferences({ expression: item.id }); setFeedback(item.note); }}>{item.label}</button>)}</div>
            <p className={styles.appearanceHint}>选择“自然”恢复动作中的表情。</p>
          </>}
          {menuSection === "outfits" && <>
            <p className={styles.groupLabel}>今天穿什么 <span>当前：{getPetOutfit(preferences.outfit).label}</span></p>
            <div className={styles.outfitGrid}>{petOutfits.map((item) => <button type="button" key={item.id} data-outfit={item.id} aria-pressed={preferences.outfit === item.id} disabled={status !== "ready"} onClick={() => { savePreferences({ outfit: item.id }); setFeedback(`换上${item.label}，继续陪你逛逛。`); }}>{item.label}</button>)}</div>
            <p className={styles.appearanceHint}>换装后，动作与表情会继续保留。</p>
          </>}
        </div>
        <div className={styles.panelFooter}><span>换个页面，我也会陪着你。</span><button type="button" onClick={() => savePreferences({ dismissed: true })}>退出互动</button></div>
      </div>}
    </section>
  );
}
