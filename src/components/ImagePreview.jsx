export default function ImagePreview({ images, onRemove }) {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {images.map(({ id, src }) => (
        <div
          key={id}
          className="relative h-20 w-20 shrink-0 overflow-hidden rounded-field border border-line"
        >
          <img src={src} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onRemove(id)}
            className="absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-ink/60 text-white transition hover:bg-ink/80"
            aria-label="이미지 삭제"
          >
            <span className="text-xs leading-none">✕</span>
          </button>
        </div>
      ))}
    </div>
  );
}
