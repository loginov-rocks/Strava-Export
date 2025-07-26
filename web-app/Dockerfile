FROM nginx:alpine
COPY src /usr/share/nginx/html
# Add .mjs MIME type to nginx configuration
RUN echo "application/javascript mjs;" >> /etc/nginx/mime.types
