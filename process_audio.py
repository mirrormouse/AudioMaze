from pydub import AudioSegment


# 犬の鳴き声音声ファイルを読み込む
dir = "public/audio/"
sound = AudioSegment.from_mp3(dir + "water.mp3")

sound = sound + 8


# 新しい音声シーケンスを作成
sequence = (
    sound
)

# 結果を保存
sequence.export(dir + "water_big.mp3", format="mp3")
