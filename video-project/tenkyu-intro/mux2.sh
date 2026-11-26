#!/bin/bash
# 映像＋ナレーション＋BGM（声の後ろで控えめに）：$1=映像 $2=出力 $3=音声ビットレート
set -e
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
ffmpeg -v error -y -i "$1" -i voice.wav -i bgm.wav -filter_complex "[2:a]atrim=0:$D,loudnorm=I=-30:TP=-6:LRA=7,afade=t=out:st=$(echo "$D-4" | bc):d=4,aresample=44100,aformat=channel_layouts=stereo[b];[1:a]atrim=0:$D,aresample=44100,aformat=channel_layouts=stereo[v];[v][b]amix=inputs=2:normalize=0,alimiter=limit=0.9[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a "$3" -shortest -movflags +faststart "$2"
