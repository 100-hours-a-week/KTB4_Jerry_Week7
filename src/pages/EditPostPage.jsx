import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost, updatePost } from "../api/post";
import { uploadImage } from "../api/image";
import { resolveImageUrl } from "../utils/image";
import { ERROR } from "../constants/messages";
import ImagePreview from "../components/ImagePreview";

export default function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [helperText, setHelperText] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);
  const previewUrlsRef = useRef([]);

  useEffect(() => {
    let alive = true;

    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    getPost(id)
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          navigate("/", { replace: true });
          return;
        }

        const post = res.body.data;
        setTitle(post.title);
        setContent(post.content);
        setImages(
          (post.post_images ?? []).map((img) => ({
            id: img.id,
            src: resolveImageUrl(img.url),
          })),
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [id, navigate]);

  if (loading) return null;

  const filled = title.trim() !== "" && content.trim() !== "";
  const displayHelper = touched && !filled ? ERROR.post.empty : helperText;

  async function handleImageChange(e) {
    const files = [...e.target.files];
    if (files.length === 0) return;

    setHelperText("");

    try {
      const results = await Promise.all(files.map((f) => uploadImage(f)));

      const failed = results.find((r) => !r.ok);
      if (failed) {
        setHelperText(ERROR.api[failed.body?.message] ?? ERROR.api.default);
        return;
      }

      const newImages = results.map((r, i) => {
        const url = URL.createObjectURL(files[i]);
        previewUrlsRef.current.push(url);
        return { id: r.body.data.id, src: url };
      });

      setImages((prev) => [...prev, ...newImages]);
    } catch {
      setHelperText(ERROR.api.default);
    } finally {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveImage(imageId) {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!filled || isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      content,
      post_image_ids: images.map((img) => img.id),
    };

    try {
      const { ok, body } = await updatePost(id, payload);

      if (ok) {
        navigate(`/posts/${id}`, { replace: true });
        return;
      }

      setHelperText(ERROR.api[body?.message] ?? ERROR.api.default);
    } catch {
      setHelperText(ERROR.api.default);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center py-14">
      <h2 className="text-title text-ink">게시글 수정</h2>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 flex w-full max-w-148 flex-col rounded-card border border-line bg-surface p-7 shadow-md"
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-label text-ink-muted">
              제목
            </label>
            <input
              id="title"
              type="text"
              placeholder="제목을 입력해주세요. (최대 26글자)"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTouched(true);
              }}
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="content" className="text-label text-ink-muted">
              내용
            </label>
            <textarea
              id="content"
              rows={10}
              placeholder="내용을 입력해주세요."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setTouched(true);
              }}
              className="min-h-60 resize-none rounded-field border border-line bg-field px-3 py-4 text-body leading-relaxed text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-label text-ink-muted">이미지</span>
            <label
              htmlFor="image"
              className="w-fit shrink-0 cursor-pointer rounded-field border border-line-strong bg-sunken px-3 py-1.5 text-label text-ink-muted transition hover:bg-line"
            >
              파일 선택
            </label>
            <ImagePreview images={images} onRemove={handleRemoveImage} />
            <input
              ref={fileInputRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
          </div>
        </div>

        <p className="mt-1.5 min-h-4.5 text-caption text-danger">
          {displayHelper}
        </p>

        <button
          type="submit"
          disabled={!filled || isSubmitting}
          className="mt-6 h-12 w-full cursor-pointer rounded-xl bg-coral text-button text-white transition hover:brightness-95 disabled:opacity-50"
        >
          수정하기
        </button>
      </form>
    </main>
  );
}
