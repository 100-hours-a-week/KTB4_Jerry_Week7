import { resolveImageUrl } from "../utils/image.js";

function replyItem(r) {
  const avatar = resolveImageUrl(r.writer.profile_image_url);
  return `
    <li class="rounded-card bg-sunken px-3 py-2.5" data-comment-id="${r.id}">
      <div class="flex items-center gap-2">
        <img src="${avatar}" alt="" class="h-5 w-5 rounded-full bg-avatar object-cover" />
        <span class="text-caption font-bold text-ink">${r.writer.nickname}</span>
        <time datetime="${r.created_at}" class="text-caption text-placeholder">${r.created_at}</time>
      </div>
      <p class="mt-1 pl-7 text-body text-ink">${r.content}</p>
    </li>`;
}

function commentItem(c) {
  const replies = c.replies?.items ?? [];
  const hasMore = c.replies?.next_cursor != null;

  const repliesBlock = `
    <ul class="reply-list mt-2 flex flex-col gap-1.5 pl-8">${replies.map(replyItem).join("")}</ul>
    ${
      hasMore
        ? `<button type="button" class="reply-more cursor-pointer mt-1 pl-8 text-caption font-medium text-coral-strong" data-cursor="${c.replies.next_cursor}">답글 더 보기</button>`
        : ""
    }`;

  if (c.is_deleted) {
    return `
      <li class="border-b border-line py-4" data-comment-id="${c.id}">
        <p class="text-body text-ink-subtle p-2 line-through">삭제된 댓글입니다.</p>
        ${repliesBlock}
      </li>`;
  }

  const avatar = resolveImageUrl(c.writer.profile_image_url);
  return `
    <li class="border-b border-line py-4" data-comment-id="${c.id}" data-writer-id="${c.writer.id}">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="${avatar}" alt="" class="h-6 w-6 rounded-full bg-avatar object-cover" />
          <span class="text-label font-bold text-ink">${c.writer.nickname}</span>
          <time datetime="${c.created_at}" class="text-caption text-placeholder">${c.created_at}</time>
        </div>
        <div class="comment-actions hidden gap-3">
          <button type="button" class="comment-edit cursor-pointer text-caption text-ink-subtle transition hover:text-ink">수정</button>
          <button type="button" class="comment-delete cursor-pointer text-caption text-ink-subtle transition hover:text-danger">삭제</button>
        </div>
      </div>
      <p class="mt-1.5 pl-8 text-body text-ink">${c.content}</p>
      <div class="mt-1.5 pl-8">
        <button type="button" class="reply-toggle cursor-pointer text-caption font-medium text-coral-strong">답글 달기</button>
      </div>
      ${repliesBlock}
    </li>`;
}

export { commentItem, replyItem };
