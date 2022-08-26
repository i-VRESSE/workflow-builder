mkdir docs/temp

# run playwright
node docs/playwright_screencast.js

# get video
ffmpeg -i docs/temp/*.webm -r 10 -f image2 docs/temp/frame-%04d.png
gifski -o docs/demo.gif docs/temp/frame*.png --width 1920

rm -r docs/temp