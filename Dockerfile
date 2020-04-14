### STAGE 1: Build ###
FROM node:12.16.1
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY --from=build /usr/src/app/dist/angular-material-formio /usr/share/nginx/html