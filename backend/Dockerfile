FROM php:8.3-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libonig-dev \
        nginx \
        python3 \
        python3-venv \
        supervisor \
    && docker-php-ext-install pdo_mysql mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY backend-turma-b/backend/requirements.txt /opt/voting/requirements.txt
RUN python3 -m venv /opt/voting/.venv \
    && /opt/voting/.venv/bin/pip install --no-cache-dir -r /opt/voting/requirements.txt

COPY backend /var/www/html/backend
COPY backend-turma-b/backend /opt/voting
COPY lib/*.json /var/www/html/lib/
COPY database/railway-init.sql /var/www/html/database/railway-init.sql
COPY backend/nginx.conf /etc/nginx/nginx.conf
COPY backend/supervisord.conf /etc/supervisor/conf.d/feira.conf

EXPOSE 8080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/feira.conf"]
