ffmpeg -r 60 -i '%07d.png' -c:v libx264 -pix_fmt yuv420p output.mp4
