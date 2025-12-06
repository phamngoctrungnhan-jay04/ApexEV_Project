#!/bin/bash
# ==========================================
# BƯỚC 6: DEPLOY ECS SERVICE
# ==========================================

set -e

# Variables
AWS_REGION="ap-southeast-1"
SERVICE_NAME="apexev-service"
DESIRED_COUNT=1

echo "=========================================="
echo "BƯỚC 6: DEPLOY ECS SERVICE"
echo "=========================================="

# Load all info files
for file in ecs-info.txt alb-info.txt; do
    if [ ! -f "$file" ]; then
        echo "❌ File $file không tồn tại!"
        echo "   Hãy chạy các scripts trước đó!"
        exit 1
    fi
    source $file
done

# Lấy subnet IDs
VPC_ID="vpc-0135fca1db04c9138"
SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $AWS_REGION)

SUBNET_ARRAY=($SUBNET_IDS)

echo ""
echo "=========================================="
echo "BƯỚC 6.1: TẠO ECS SERVICE"
echo "=========================================="

echo "Đang tạo ECS Service: $SERVICE_NAME..."
echo "⏱️  Quá trình này mất 2-3 phút..."

# Tạo service
aws ecs create-service \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --task-definition $TASK_FAMILY \
    --desired-count $DESIRED_COUNT \
    --launch-type FARGATE \
    --platform-version LATEST \
    --network-configuration "awsvpcConfiguration={
        subnets=[${SUBNET_ARRAY[0]},${SUBNET_ARRAY[1]},${SUBNET_ARRAY[2]}],
        securityGroups=[$ECS_SG_ID],
        assignPublicIp=ENABLED
    }" \
    --load-balancers "targetGroupArn=$TG_ARN,containerName=apexev-container,containerPort=8080" \
    --health-check-grace-period-seconds 60 \
    --region $AWS_REGION \
    2>/dev/null || echo "Service đã tồn tại, đang update..."

# Nếu service đã tồn tại, update nó
if [ $? -ne 0 ]; then
    echo "Service đã tồn tại, đang update..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service $SERVICE_NAME \
        --task-definition $TASK_FAMILY \
        --desired-count $DESIRED_COUNT \
        --force-new-deployment \
        --region $AWS_REGION
fi

echo "✅ ECS Service đã được tạo/update!"

echo ""
echo "=========================================="
echo "BƯỚC 6.2: CHỜ SERVICE KHỞI ĐỘNG"
echo "=========================================="

echo "⏳ Đang chờ ECS tasks khởi động..."
echo "   Bạn có thể theo dõi tại:"
echo "   https://ap-southeast-1.console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/services/$SERVICE_NAME"
echo ""
echo "   Quá trình này mất 3-5 phút..."
echo ""

# Chờ service stable
aws ecs wait services-stable \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION

echo "✅ ECS Service đã stable!"

echo ""
echo "=========================================="
echo "BƯỚC 6.3: KIỂM TRA TASKS"
echo "=========================================="

# Lấy task ARN
TASK_ARN=$(aws ecs list-tasks \
    --cluster $CLUSTER_NAME \
    --service-name $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'taskArns[0]' \
    --output text)

if [ "$TASK_ARN" != "None" ] && [ ! -z "$TASK_ARN" ]; then
    echo "✅ Task ARN: $TASK_ARN"
    
    # Lấy task details
    TASK_STATUS=$(aws ecs describe-tasks \
        --cluster $CLUSTER_NAME \
        --tasks $TASK_ARN \
        --region $AWS_REGION \
        --query 'tasks[0].lastStatus' \
        --output text)
    
    echo "✅ Task Status: $TASK_STATUS"
else
    echo "⚠️  Không tìm thấy task đang chạy"
fi

echo ""
echo "=========================================="
echo "BƯỚC 6.4: KIỂM TRA TARGET HEALTH"
echo "=========================================="

echo "Đang kiểm tra Target Group health..."
sleep 10  # Đợi health check

TARGET_HEALTH=$(aws elbv2 describe-target-health \
    --target-group-arn $TG_ARN \
    --region $AWS_REGION \
    --query 'TargetHealthDescriptions[0].TargetHealth.State' \
    --output text 2>/dev/null || echo "unknown")

echo "Target Health: $TARGET_HEALTH"

if [ "$TARGET_HEALTH" == "healthy" ]; then
    echo "✅ Target đã healthy!"
elif [ "$TARGET_HEALTH" == "initial" ]; then
    echo "⏳ Target đang trong quá trình health check..."
    echo "   Đợi thêm 1-2 phút..."
else
    echo "⚠️  Target health: $TARGET_HEALTH"
    echo "   Có thể cần thêm thời gian để healthy"
fi

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 6: DEPLOY"
echo "=========================================="
echo ""
echo "📝 Thông tin Deployment:"
echo "   Cluster: $CLUSTER_NAME"
echo "   Service: $SERVICE_NAME"
echo "   Task Definition: $TASK_FAMILY"
echo "   Desired Count: $DESIRED_COUNT"
echo "   Task ARN: $TASK_ARN"
echo ""
echo "📝 URL để truy cập app:"
echo "   http://$ALB_DNS"
echo "   http://$ALB_DNS/actuator/health"
echo "   http://$ALB_DNS/api/auth/login"
echo ""
echo "⚠️  LƯU Ý:"
echo "   - Nếu target chưa healthy, đợi thêm 1-2 phút"
echo "   - Kiểm tra logs tại CloudWatch: $LOG_GROUP"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 07-verify.sh để test"
echo ""

# Lưu thông tin
cat > deployment-info.txt <<EOF
SERVICE_NAME=$SERVICE_NAME
TASK_ARN=$TASK_ARN
ALB_URL=http://$ALB_DNS
HEALTH_CHECK_URL=http://$ALB_DNS/actuator/health
API_BASE_URL=http://$ALB_DNS/api
EOF

echo "💾 Thông tin đã được lưu vào file: deployment-info.txt"
echo ""
