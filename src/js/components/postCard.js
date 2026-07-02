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
        class="block rounded-xl border border-gray-200 bg-white py-5 shadow-sm transition hover:shadow-md"
      >
        <div class="px-5">
          <h2 class="text-lg font-bold">${title}</h2>
          <div class="mt-1 flex items-center justify-between text-sm">
            <div class="flex gap-x-3">
              <span>좋아요 <span>${formatCount(item.like_count)}</span></span>
              <span>댓글 <span>${formatCount(item.comment_count)}</span></span>
              <span>조회수 <span>${formatCount(item.view_count)}</span></span>
            </div>
            <time datetime="${item.created_at}">${item.created_at}</time>
          </div>
        </div>
      
        <hr class="my-3 border-gray-200" />

        <div class="flex items-center gap-2 px-5">
          <img
            src="${avatar}"
            alt=""
            class="h-6 w-6 rounded-full object-cover bg-gray-200"
          />
          <span class="text-sm font-medium">${item.writer.nickname}</span>
        </div>
      </a>
    </li>
`;
}

export { postCard };
