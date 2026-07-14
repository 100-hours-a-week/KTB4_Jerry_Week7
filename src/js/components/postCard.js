import { formatCount, truncateTitle } from "../utils/format.js";
import { resolveImageUrl } from "../utils/image.js";

function postCard(item) {
  const title = item.is_blinded
    ? "블라인드 처리된 게시글입니다."
    : truncateTitle(item.title);

  const avatar = resolveImageUrl(item.writer.profile_image_url);

  return `
    <li>
      <a
        href="/pages/post-detail.html?id=${item.id}"
        class="block rounded-card border border-line bg-surface p-5 shadow-sm transition hover:shadow-md"
      >
        <h2 class="text-card ${item.is_blinded ? "text-ink-subtle" : "text-ink"}">${title}</h2>
        <div class="mt-4 flex items-center justify-between text-caption">
          <div class="flex items-center gap-3 text-ink-subtle">
            <span>♡ ${formatCount(item.like_count)}</span>
            <span>댓글 ${formatCount(item.comment_count)}</span>
            <span>조회수 ${formatCount(item.view_count)}</span>
          </div>
          <div class="flex items-center gap-2">
            <img src="${avatar}" class="h-5 w-5 rounded-full bg-avatar object-cover"/>
            <span class="font-medium text-ink-muted">${item.writer.nickname}</span>
            <time datetime="${item.created_at}" class="text-placeholder">${item.created_at}</time>
          </div>
        </div>
      </a>
    </li>
`;
}

export { postCard };
