# Stage 1: Build the Angular application
FROM node:18-alpine AS build
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
# The --configuration production flag is important for optimizations
RUN npm run build -- --configuration production

# Stage 2: Serve the application from a lightweight Nginx server
FROM nginx:1.25-alpine
# Copy the built artifacts from the 'build' stage
COPY --from=build /usr/src/app/dist/shell-app-angular /usr/share/nginx/html
# Copy a custom nginx config to handle SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]