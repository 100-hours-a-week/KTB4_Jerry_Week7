import { resolveImageUrl } from "../utils/image.js";

function commentItem(c) {
  if (c.is_deleted) {
    return `
        <li class="border-b border-gray-100 p-4">
            <p class="text-sm text-gray-400">삭제된 댓글입니다.</p>
        </li>`;
  }

  const avatar = resolveImageUrl(c.writer.profile_image_url);

  return `
        <li 
            class="border-b border-gray-100 p-4"
            data-comment-id="${c.id}"
            data-writer-id="${c.writer.id}"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm">
              <img src="${avatar}" class="h-6 w-6 rounded-full bg-gray-200">
              <span class="font-bold">${c.writer.nickname}</span>
              <time datetime="${c.created_at}" class="text-gray-500"
                >${c.created_at}</time
              >
            </div>

            <div class="comment-actions hidden gap-2">
              <button
                type="button"
                class="comment-edit rounded-md border border-gray-300 px-2 py-1 text-xs w-10"
              >
                수정
              </button>

              <button
                type="button"
                class="comment-delete rounded-md border border-gray-300 px-2 py-1 text-xs w-10"
              >
                삭제
              </button>
            </div>
          </div>
          <p class="mt-2 pl-8 text-sm">${c.content}</p>
        </li>`;
}

export { commentItem };
