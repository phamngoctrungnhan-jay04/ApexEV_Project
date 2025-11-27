#!/bin/bash
# ==========================================
# UPDATE APPLICATION - Deploy code mới
# ==========================================
# Script này dùng để deploy code mới sau khi đã setup xong
# Chỉ cần: Build → Push → Update ECS

set -e

AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="029930584678"
ECR_REPOSITORY="apexev"
IMAGE_TAG="latest"

echo "=========================================="
echo "UPDATE APPLICATION"
echo "=========================================="

# Load info
if [ ! -f "ecs-info.txt" ]; then
    echo "❌ File ecs-info.txt không tồn tại!"
    exit 1
fi

source ecs-info.txt

echo ""
echo "=========================================="
echo "BƯỚC 1: BUILD DOCKER IMAGE"
echo "=========================================="

echo "Đang build Docker image..."
cd ..
docker build -t apexev:latest .
cd aws-deployment

echo "✅ Build thành công!"

echo ""
echo "=========================================="
echo "BƯỚC 2: LOGIN VÀO ECR"
echo "=========================================="

aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin \
    $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "✅ Login thành công!"

echo ""
echo "=========================================="
echo "BƯỚC 3: TAG & PUSH IMAGE"
echo "=========================================="

ECR_IMAGE_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG"
docker tag apexev:latest $ECR_IMAGE_URI
docker push $ECR_IMAGE_URI

echo "✅ Push thành công!"

echo ""
echo "=========================================="
echo "BƯỚC 4: UPDATE ECS SERVICE"
echo "=========================================="

echo "Đang update ECS service..."
echo "⏱️  Quá trình này mất 2-3 phút..."

aws ecs update-service \
    --cluster $CLUSTER_NAME \
    --service apexev-service \
    --force-new-deployment \
    --region $AWS_REGION \
    --query 'service.serviceName' \
    --output text

echo "✅ ECS service đã được update!"

echo ""
echo "=========================================="
echo "BƯỚC 5: CHỜ DEPLOYMENT HOÀN TẤT"
echo "=========================================="

echo "⏳ Đang chờ deployment hoàn tất..."
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services apexev-service \
    --region $AWS_REGION

echo "✅ Deployment hoàn tất!"

echo ""
echo "=========================================="
echo "✅ UPDATE THÀNH CÔNG!"
echo "=========================================="
echo ""
echo "📝 Bạn có thể:"
echo "   1. Chạy script 07-verify.sh để test"
echo "   2. Kiểm tra logs trên CloudWatch"
echo "   3. Test API endpoints"
echo ""
