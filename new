#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <name>"
  exit 1
fi

name="$1"
permalink=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')
script_dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
filename="$script_dir/_wiki/${permalink}.markdown"

if [ -e "$filename" ]; then
  echo "File '$filename' already exists."
  exit 0
fi

file_content="---
layout: pagev2
title: $name
permalink: /$permalink/
---
- [Background](#background)

## Background"

echo -e "$file_content" > "$filename"
echo "Wiki page '$permalink' created successfully."
