# Use a lightweight, official Nginx image as the base
FROM nginx:1.25-alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom Nginx configuration into the container.
# This configuration file will be set up to listen on port 443 and
# will point to the paths where we expect the SSL certificates to be.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose ports 80 for HTTP (for redirects) and 443 for HTTPS (for main traffic)
EXPOSE 80
EXPOSE 443

# The CMD is inherited from the base image, which is: ["nginx", "-g", "daemon off;"]
# This starts Nginx in the foreground, which is standard practice for containers.

# --- IMPORTANT ---
# We do NOT copy the SSL certificates here.
# They will be mounted into the running container using Docker Secrets.
# The `nginx.conf` file will reference them at a path like:
# /etc/letsencrypt/live/sparkdevop.com/fullchain.pem