FROM php:8.3-apache

RUN apt-get update \
    && apt-get install -y --no-install-recommends libonig-dev \
    && docker-php-ext-install pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/* \
    && a2enmod rewrite headers

ENV APACHE_DOCUMENT_ROOT=/var/www/html/backend/public

COPY backend /var/www/html/backend
COPY lib/*.json /var/www/html/lib/
COPY database/railway-init.sql /var/www/html/database/railway-init.sql

RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && printf '<Directory /var/www/html/backend/public>\nAllowOverride All\nRequire all granted\n</Directory>\n' > /etc/apache2/conf-available/feira-api.conf \
    && a2enconf feira-api

EXPOSE 80
