FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./

ENV VITE_API_BASE_URL=""
ENV VITE_USE_MOCKS="false"
ENV VITE_SHOW_DEMO_HINT="false"

RUN npm run build

FROM composer:2 AS backend-vendor

WORKDIR /app/backend

COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        exif \
        pcntl \
        bcmath \
        gd \
        zip

RUN printf "upload_max_filesize = 10M\npost_max_size = 12M\nmemory_limit = 256M\n" \
    > /usr/local/etc/php/conf.d/saparw-uploads.ini

WORKDIR /var/www/saparw

COPY backend/ ./backend/
COPY --from=backend-vendor /app/backend/vendor ./backend/vendor
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

RUN rm -f /etc/nginx/http.d/default.conf
COPY deploy/docker-nginx.conf /etc/nginx/http.d/saparw.conf
COPY deploy/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Strip Windows CRLF line endings so the entrypoint executes cleanly on Linux containers.
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
    && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
