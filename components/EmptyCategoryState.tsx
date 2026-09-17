export function EmptyCategoryState() {
  return (
    <section className="empty-state" aria-labelledby="empty-state-title">
      <div className="empty-state__drawer" aria-hidden="true">
        <span className="empty-state__label">COMING SOON</span>
        <span className="empty-state__handle" />
        <span className="empty-state__spark">✳</span>
      </div>
      <div>
        <span className="small-label">先留一个位置</span>
        <h2 id="empty-state-title">这个抽屉正在整理中。</h2>
        <p>有准备好的内容后，会放在这里。</p>
      </div>
    </section>
  );
}
