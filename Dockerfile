FROM nginx

WORKDIR /usr/share/nginx/html

COPY ./build  ./

EXPOSE 80
EXPOSE 443