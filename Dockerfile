FROM node:6.0.0
EXPOSE 12003
RUN mkdir /opt/graphite-es-bridge
WORKDIR /opt/graphite-es-bridge
ADD ./index.js /opt/graphite-es-bridge/index.js
ADD ./package.json /opt/graphite-es-bridge/package.json

RUN npm i

ENTRYPOINT ["node", "index"]
