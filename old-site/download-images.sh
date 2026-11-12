#!/bin/bash
# Run on your Mac:  bash download-images.sh
# Saves every image from the old Squarespace site into ./old-site-images
mkdir -p old-site-images
cd old-site-images
while read -r url; do
  [ -z "$url" ] && continue
  name=$(echo "$url" | awk -F/ '{print $(NF-1)"-"$NF}' | sed 's/%2[89]//g; s/+/-/g')
  curl -sSL "$url" -o "$name" && echo "saved $name"
done < ../image-urls.txt
