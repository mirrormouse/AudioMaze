export const Constants = {

    // 3D描画用の定数
    PLAYER_HEIGHT: 17, // プレイヤーの視点の高さ
    FIELD_OF_VIEW: 90, // 視野角（度）
    WALL_HEIGHT: 90, // 壁の高さ
    COLORS: {
        FLOOR: '#FFF0E0',
        WALL_NEAR: '#CAB797',  // 近くの壁の色
        WALL_FAR: '#887964',   // 遠くの壁の色
        CEILING: '#F1F1FA',
    },
    MAX_RENDER_DISTANCE: 2000, // 最大描画距離（マス）
    // 操作ボタンの設定
    BUTTON_LONG_PRESS_DELAY: 300, // 長押し判定までの時間（ミリ秒）
    BUTTON_REPEAT_INTERVAL: 150, // 長押し時の繰り返し間隔（ミリ秒）
};