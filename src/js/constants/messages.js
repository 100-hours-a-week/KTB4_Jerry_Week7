export const ERROR = {
  email: {
    empty: "*이메일을 입력해주세요.",
    invalid:
      "*올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)",
    duplicated: "*중복된 이메일 입니다.",
  },

  password: {
    empty: "*비밀번호를 입력해주세요.",
    invalid:
      "*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.",
  },

  passwordConfirm: {
    empty: "*비밀번호를 한번더 입력해주세요.",
    mismatch: "*비밀번호가 다릅니다.",
  },

  profile: {
    required: "*프로필 사진을 추가해주세요.",
  },

  nickname: {
    empty: "*닉네임을 입력해주세요.",
    space: "*띄어쓰기를 없애주세요.",
    duplicated: "*중복된 닉네임 입니다.",
    tooLong: "*닉네임은 최대 10자 까지 작성 가능합니다.",
  },

  post: {
    empty: "*제목, 내용을 모두 작성해주세요",
  },

  api: {
    invalid_credentials: "*아이디 또는 비밀번호를 확인해주세요.",
    bad_request: "*입력값을 확인해주세요.",
    image_not_found: "*이미지를 찾을 수 없습니다.",
    too_large_file: "*파일 크기가 너무 큽니다.",
    unsupported_media_type: "*지원하지 않는 파일 형식입니다.",
    default: "*잠시 후 다시 시도해주세요.",
  },
};
