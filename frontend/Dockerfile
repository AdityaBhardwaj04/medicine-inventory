# Use an official Node runtime as a parent image
FROM node:16

# Install dependencies
RUN apt-get update && apt-get install -y \
    libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev \
    libxss1 libx11-xcb1 libxkbfile1 \
    xvfb

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install npm dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app for production
RUN npm run build

# Install Electron
RUN npm install electron

# Add a script to run Xvfb and Electron
COPY start-electron.sh /usr/local/bin/start-electron.sh
RUN chmod +x /usr/local/bin/start-electron.sh

# Expose the port
EXPOSE 3000

# Start the Electron app
CMD ["start-electron.sh"]
