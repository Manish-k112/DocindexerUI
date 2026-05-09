# Stage 1 — Build
FROM acrproperpayqascus.azurecr.io/secure-ubuntu-24-04:latest AS build

WORKDIR /usr/local/app

RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        gnupg \
        build-essential \
        python3 \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN npm cache clean --force \
    && rm -rf node_modules package-lock.json \
    && npm install --legacy-peer-deps \
    && npm run build

# Stage 2 — Runtime
FROM acrproperpayqascus.azurecr.io/nginx:latest

COPY --from=build /usr/local/app/dist/docindexer-ui /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
