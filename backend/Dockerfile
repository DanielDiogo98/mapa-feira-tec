FROM php:8.3-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY backend /var/www/html/backend
COPY lib/*.json /var/www/html/lib/
COPY database/railway-init.sql /var/www/html/database/railway-init.sql

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "/var/www/html/backend/public", "/var/www/html/backend/public/index.php"]
