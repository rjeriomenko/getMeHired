# Use an official Node.js image
FROM node:21.4

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install necessary dependencies
RUN apt-get update && \
    apt-get install -y xvfb ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils && \
    rm -rf /var/lib/apt/lists/*

# # Create a non-root user
# RUN groupadd -r myuser && useradd -r -g myuser -m myuser

# # Give ownership of the working directory to the new user
# COPY --chown=myuser:myuser . .

# # Switch to the non-root user
# USER myuser

# Set the display environment variable
ENV DISPLAY=:99
ENV NO_PROXY=localhost,127.0.0.1

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose any necessary ports
EXPOSE 8080

# Command to run your application
CMD [ "npm", "start" ]
