FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY docker/lab-interpretation/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files to nginx html directory (use trailing slash to copy contents)
COPY lab-interpretation/src/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

