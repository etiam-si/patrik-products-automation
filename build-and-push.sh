#!/usr/bin/env bash
set -e

IMAGE="etiamsi/patrik-products-automation"

docker build . -t "$IMAGE"
docker push "$IMAGE"

echo "Build and push completed successfully"
