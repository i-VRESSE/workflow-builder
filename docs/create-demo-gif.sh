mkdir docs/temp

# run playwright
node docs/playwright_screencast.js

# create high quality GIF with gif.ski
ffmpeg -i docs/temp/*.webm -f image2 docs/temp/frame-%04d.png
gifski -o docs/demo.gif docs/temp/frame*.png --width 1600

rm -r docs/temp