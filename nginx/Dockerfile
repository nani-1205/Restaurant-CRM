# Filename: nginx/Dockerfile

# Use the official lightweight Nginx image
FROM nginx:1.25-alpine

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy our custom configuration file from the 'conf' directory
# This file will define all our routing, upstreams, and SSL settings
COPY conf/sparkdevop.conf /etc/nginx/conf.d/sparkdevop.conf

# Create a directory for SSL certs
RUN mkdir -p /etc/nginx/ssl