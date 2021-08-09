FROM gitpod/workspace-full

ENV TRIGGER_REBUILD 1

RUN bash -cl "rustup target add wasm32-unknown-unknown"

RUN bash -c ". .nvm/nvm.sh \
             && nvm install v12 && nvm alias default v12"