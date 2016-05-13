FROM node:6.1.0
EXPOSE 12003
RUN mkdir /opt/graphite-es-bridge
WORKDIR /opt/graphite-es-bridge
ADD . /opt/graphite-es-bridge

RUN npm i --production

ENTRYPOINT ["node", "index"]
