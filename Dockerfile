FROM node:20-slim AS base
## Remove corepack and install pnpm directly
RUN npm install -g pnpm
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --no-frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile
RUN pnpm build

FROM base
RUN rm -rf /app/node_modules
COPY --from=prod-deps /app/node_modules /app/node_modules
RUN ls -la /app
COPY --from=build /app/dist /app/dist
EXPOSE 3000
CMD [ "pnpm", "dev" ]