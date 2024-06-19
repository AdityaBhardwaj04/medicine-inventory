#!/bin/bash

# Start Xvfb (X virtual framebuffer) on display :99
Xvfb :99 -screen 0 1024x768x16 &

# Set the DISPLAY environment variable to use the virtual display
export DISPLAY=:99

# Start the Electron application
npm run electron
