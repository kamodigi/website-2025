#!/bin/bash

# スクリプトが失敗した場合に実行を停止する
set -e

# イメージ名とタグを設定
IMAGE_NAME="portfolio-2025"
TAG="latest"

# Docker BuildKitを有効にする (推奨)
export DOCKER_BUILDKIT=1

# Dockerイメージをビルドする
echo "Building Docker image: ${IMAGE_NAME}:${TAG}"
docker build -t "${IMAGE_NAME}:${TAG}" .

echo "Docker image build complete: ${IMAGE_NAME}:${TAG}"

# ビルドしたイメージのサイズを表示
echo "Image size:"
docker images "${IMAGE_NAME}:${TAG}"
