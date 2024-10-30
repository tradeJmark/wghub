FROM alpine:3.20.3
COPY target/x86_64-unknown-linux-musl/release/wghub-backend /bin
ENV WGHUB_CORS_ORIGINS=any
ENV WGHUB_CORS_METHODS=GET,POST,DELETE
CMD /bin/wghub-backend