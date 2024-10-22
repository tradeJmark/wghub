FROM alpine:3.20.3
COPY wghub-ui/dist /www
COPY target/x86_64-unknown-linux-musl/release/wghub-backend /bin
ENV WGHUB_FRONTEND_PATH=/www
ENV WGHUB_PORT=80
CMD /bin/wghub-backend