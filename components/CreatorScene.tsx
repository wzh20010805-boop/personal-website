import { CategoryArt } from "./CategoryArt";
import { CreatorCharacter } from "./CreatorCharacter";
import { site } from "@/data/site";

export function CreatorScene() {
  return (
    <figure className="creator-scene" aria-label="猫咪创作者的糖果色工作台插画">
      <div className="scene-backdrop" aria-hidden="true">
        <div className="scene-blob scene-blob--yellow" />
        <div className="scene-blob scene-blob--pink" />
        <div className="scene-halftone" />
        <svg className="scene-doodles" viewBox="0 0 560 540" fill="none">
          <g stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m303 24 10 23 24 5-22 13-2 25-16-19-24 6 13-22Z" fill="var(--skill)" />
            <path d="m43 262 7 15 17 3-15 9-2 17-10-13-16 3 8-14Z" fill="var(--paper-light)" />
            <path d="m497 155 7 15 16 1-12 11 3 17-15-9-14 8 2-17-12-11 17-2Z" fill="var(--skill)" />
            <path d="m359 98 7-14m3 22 15-6M99 171l-14-9m13 24-19 1m388 151 15 7m-16-23 18 1" />
            <path d="m116 492 6 13 14 2-12 8-1 13-9-11-15 3 8-12-6-13Z" fill="var(--learning)" />
            <path d="M417 477q23 8 32-16m-5-2 6 1 1 7" />
          </g>
        </svg>
      </div>
      <span className="scene-sticker">欢迎来到我的脑洞！</span>
      <svg className="scene-platform" viewBox="0 0 500 155" fill="none" aria-hidden="true">
        <g stroke="var(--ink)" strokeWidth="5" strokeLinejoin="round">
          <path d="m51 63 185-35 220 32 4 46-194 43L49 107Z" fill="var(--ink)" />
          <path d="m32 50 203-35 222 34v44l-208 41L32 91Z" fill="var(--learning)" />
          <path d="m32 50 214 33 211-34-222-34Z" fill="var(--paper-light)" />
          <path d="M246 83v51M46 62l187 29" />
          <path d="m319 74 9 30m7-33 8 27m7-28 8 25m7-29 7 25m8-28 7 23m8-25 5 23m9-27 5 24" opacity=".45" strokeWidth="2" />
        </g>
      </svg>
      <CreatorCharacter />
      <div className="scene-object scene-object--prompts"><CategoryArt kind="prompts" /></div>
      <div className="scene-object scene-object--tools"><CategoryArt kind="tools" /></div>
      <div className="scene-object scene-object--games"><CategoryArt kind="games" /></div>
      <div className="scene-object scene-object--skills"><CategoryArt kind="skills" /></div>
      <div className="scene-object scene-object--agents"><CategoryArt kind="agents" /></div>
      <div className="scene-object scene-object--learning"><CategoryArt kind="learning" /></div>
      <figcaption>{site.character.isPlaceholder ? "猫咪创作者 · 临时角色占位" : "我的创作工作台"}</figcaption>
    </figure>
  );
}
