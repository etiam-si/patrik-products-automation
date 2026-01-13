# ---- Base Stage ----
# Use an official Node.js Long-Term Support (LTS) version on a lean OS like Alpine.
FROM node:alpine AS base

# Set the working directory in the container
WORKDIR /usr/src/app

#
# ---- Dependencies Stage ----
# This stage is dedicated to installing Node.js dependencies.
#
FROM base AS dependencies

# Copy package.json and package-lock.json to leverage Docker cache.
# This step will only be re-run if these files change.
COPY package.json package-lock.json* ./

# Install production dependencies using 'npm ci' for faster, reliable builds.
RUN npm ci --only=production

#
# ---- Production Stage ----
# This is the final, lean image that will run in production.
#
FROM base AS production

# Set the environment to production.
# Your index.js will not load .env.development, which is correct for production.
ENV NODE_ENV=production

# Define the path for your application's data.
ENV DATA_PATH=/data

# Copy the installed production dependencies from the 'dependencies' stage.
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Copy the rest of your application source code.
COPY . .

# The node base image creates a non-root user 'node' for security.
# Create the data directory and change its ownership to the 'node' user.
# This must be done as root, *before* switching to the 'node' user.
RUN mkdir -p ${DATA_PATH} && chown -R node:node ${DATA_PATH}

# Switch to the non-root 'node' user for better security.
USER node

# Expose the port your app will run on.
EXPOSE 3000

# The command to start your application.
CMD ["node", "index.js"]
