#!/bin/bash
# ==========================================
# BƯỚC 1: SETUP ECR (Elastic Container Registry)
# ==========================================
# Script này tạo ECR repository và push Docker image

set -e  # Exit on error

# Variables
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="029930584678"
ECR_REPOSITORY="apexev"
IMAGE_TAG="latest"

echo "=========================================="
echo "BƯỚC 1: TẠO ECR REPOSITORY"
echo "=========================================="

# Tạo ECR repository
echo "Đang tạo ECR repository: $ECR_REPOSITORY..."
aws ecr create-repository \
    --repository-name $ECR_REPOSITORY \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null || echo "Repository đã tồn tại, bỏ qua..."

echo "✅ ECR repository đã sẵn sàng!"

echo ""
echo "=========================================="
echo "BƯỚC 2: LOGIN VÀO ECR"
echo "=========================================="

# Login vào ECR
echo "Đang login vào ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "✅ Login thành công!"

echo ""
echo "=========================================="
echo "BƯỚC 3: TAG DOCKER IMAGE"
echo "=========================================="

# Tag image
ECR_IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
echo "Đang tag image: apexev:latest → $ECR_IMAGE_URI"
docker tag apexev:latest $ECR_IMAGE_URI

echo "✅ Tag thành công!"

echo ""
echo "=========================================="
echo "BƯỚC 4: PUSH IMAGE LÊN ECR"
echo "=========================================="

# Push image
echo "Đang push image lên ECR (có thể mất 5-10 phút)..."
docker push $ECR_IMAGE_URI

echo "✅ Push thành công!"

echo ""
echo "=========================================="
echo "BƯỚC 5: VERIFY IMAGE"
echo "=========================================="

# Verify
echo "Đang kiểm tra image trên ECR..."
aws ecr describe-images \
    --repository-name $ECR_REPOSITORY \
    --region $AWS_REGION \
    --query 'imageDetails[*].[imageTags[0],imageSizeInBytes,imagePushedAt]' \
    --output table

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 1: ECR SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin quan trọng:"
echo "   ECR Repository: $ECR_REPOSITORY"
echo "   Image URI: $ECR_IMAGE_URI"
echo "   Region: $AWS_REGION"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 02-rds-setup.sh"
echo ""
