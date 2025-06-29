#!/bin/bash
cd /home/kavia/workspace/code-generation/notemaster-web-94864-c1c08c1c/notes_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

