export const AudioConstants = {
    SPEED_OF_SOUND: 3430, // 音速 (m/s)
    MAX_DISTANCE: 1000, // 最大可聴距離 (ピクセル)
    DISTANCE_MODEL: 'inverse' as PannerNode['distanceModel'], // 距離による減衰モデル
    REF_DISTANCE: 10, // 基準距離 (この距離で音量が基準値になる)
    MAX_DISTANCE_PANNER: 10000, // パンナーの最大距離
    ROLLOFF_FACTOR: 0.5, // 音量の減衰率 (小さいほど遠くまで聞こえる)
    WALL_ATTENUATION: 0.9, // 壁による減衰率 (1に近いほど減衰が少ない)
    WALL_INTERVAL: 200, // 壁の間隔 (ピクセル)
    DOPPLER_FACTOR: 0.01, // ドップラー効果の強さ (0-1)
    REVERB_DURATION: 0.1, // 残響時間 (秒)
    REVERB_DECAY: 0.4, // 残響の減衰率
    MAX_REFLECTIONS: 2, // 最大反射回数
    REFLECTION_COEFFICIENT: 0.3, // 反射係数 (0-1)
    OBSTRUCTION_COEFFICIENT: 0.03, // 遮蔽係数 (壁を通過する音の減衰率)
};

export type AudioSourcePath = {
    points: { x: number; y: number }[];
    speed: number; // ピクセル/秒
};
