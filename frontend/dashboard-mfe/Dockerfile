# Stage 1: Build the React application
# Use a specific version of Node for consistency
FROM node:18.18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker layer caching
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the production-ready static files
RUN npm run build

# Stage 2: Serve the application using Nginx
# Use a lightweight Nginx image
FROM nginx:1.25-alpine

# Copy the built static files from the 'build' stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the container will listen on
EXPOSE 3002

# The command to start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]