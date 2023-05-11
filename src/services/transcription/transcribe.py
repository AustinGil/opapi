import whisper

model = whisper.load_model("base")
result = model.transcribe('Record.mp3')
print(result["text"])
