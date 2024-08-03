from pydub import AudioSegment


# 犬の鳴き声音声ファイルを読み込む
dir = "public/audio/"
dog_bark = AudioSegment.from_mp3(dir + "dog.mp3")

# 無音の部分を作成（空のAudioSegmentを使用）
silence_1s = AudioSegment.silent(duration=500)  # 1秒 = 1000ミリ秒
silence_2s = AudioSegment.silent(duration=800)  # 2秒
silence_3s = AudioSegment.silent(duration=1600)  # 3秒

# 新しい音声シーケンスを作成
sequence = (
    dog_bark +
    silence_1s +
    dog_bark +
    silence_3s +
    dog_bark +
    silence_2s
)

# 結果を保存
sequence.export(dir + "dog_bark.mp3", format="mp3")

print("音声シーケンスが作成されました: dog_bark_sequence.mp3")