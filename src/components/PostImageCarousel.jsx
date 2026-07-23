import { useState } from "react";
import { resolveImageUrl } from "../utils/image";

export default function PostImageCarousel({ images }) {
  const [index, setIndex] = useState(0);

  if (!images.length) return null;

  return (
    <div className="relative overflow-hidden rounded-card bg-sunken">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img) => (
          <img
            key={img.id ?? img.url}
            src={resolveImageUrl(img.url)}
            alt=""
            className="h-90 w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex((i) => i - 1)}
          className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-ink/45 text-2xl leading-none text-white transition hover:bg-ink/65"
        >
          ‹
        </button>
      )}

      {index < images.length - 1 && (
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-ink/45 text-2xl leading-none text-white transition hover:bg-ink/65"
        >
          ›
        </button>
      )}

      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
