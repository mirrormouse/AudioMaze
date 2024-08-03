export const STAGE_BGM: { [key: number]: string } = {
    1: '/audio/spring.mp3',
    2: '/audio/pond.mp3',
    3: '/audio/street.mp3',
    // 必要なだけステージを追加
};

export const BGM_VOLUME: { [key: number]: number } = {
    1: 0.02,
    2: 0.02,
    3: 0.02,
    // 必要なだけステージを追加
};

// デフォルトのBGM（IDが一致しない場合に使用）
export const DEFAULT_BGM = '/audio/spring.mp3';