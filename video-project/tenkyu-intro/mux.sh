#!/bin/bash
# 映像にBGMを重ねる：$1=映像 $2=出力 $3=音声ビットレート
set -e
D=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
ffmpeg -v error -y -i "$1" -i bgm.wav -filter_complex "[1:a]atrim=0:$D,loudnorm=I=-20:TP=-2:LRA=7,afade=t=out:st=$(echo "$D-4" | bc):d=4,aresample=44100[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a "$3" -shortest -movflags +faststart "$2"
