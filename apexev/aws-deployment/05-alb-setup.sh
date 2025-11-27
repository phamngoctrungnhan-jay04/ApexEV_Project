#!/bin/bash
# ==========================================
# BƯỚC 5: SETUP APPLICATION LOAD BALANCER
# ==========================================

set -e

# Variables
AWS_REGION="ap-southeast-1"
VPC_ID="vpc-0135fca1db04c9138"
ALB_NAME="apexev-alb"
TG_NAME="apexev-tg"

echo "=========================================="
echo "BƯỚC 5: SETUP APPLICATION LOAD BALANCER"
echo "=========================================="

# Load RDS info để lấy Security Group
if [ ! -f "rds-info.txt" ]; then
    echo "❌ File rds-info.txt không tồn tại!"
    exit 1
fi

source rds-info.txt

echo ""
echo "=========================================="
echo "BƯỚC 5.1: TẠO SECURITY GROUP CHO ALB"
echo "=========================================="

ALB_SG_NAME="apexev-alb-sg"
echo "Đang tạo Security Group cho ALB..."

ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name $ALB_SG_NAME \
    --description "Security group for ApexEV ALB" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$ALB_SG_NAME" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo "✅ ALB Security Group ID: $ALB_SG_ID"

# Cho phép HTTP từ internet
echo "Đang cấu hình inbound rules cho ALB..."
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION \
    2>/dev/null || echo "HTTP rule đã tồn tại"

# Cho phép HTTPS từ internet (cho sau này)
aws ec2 authorize-security-group-ingress \
    --group-id $ALB_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 \
    --region $AWS_REGION \
    2>/dev/null || echo "HTTPS rule đã tồn tại"

echo "✅ ALB Security Group đã được cấu hình!"

echo ""
echo "=========================================="
echo "BƯỚC 5.2: TẠO SECURITY GROUP CHO ECS"
echo "=========================================="

ECS_SG_NAME="apexev-ecs-sg"
echo "Đang tạo Security Group cho ECS..."

ECS_SG_ID=$(aws ec2 create-security-group \
    --group-name $ECS_SG_NAME \
    --description "Security group for ApexEV ECS tasks" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$ECS_SG_NAME" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo "✅ ECS Security Group ID: $ECS_SG_ID"

# Cho phép traffic từ ALB
echo "Đang cấu hình inbound rules cho ECS..."
aws ec2 authorize-security-group-ingress \
    --group-id $ECS_SG_ID \
    --protocol tcp \
    --port 8080 \
    --source-group $ALB_SG_ID \
    --region $AWS_REGION \
    2>/dev/null || echo "ALB rule đã tồn tại"

echo "✅ ECS Security Group đã được cấu hình!"

echo ""
echo "=========================================="
echo "BƯỚC 5.3: CẬP NHẬT RDS SECURITY GROUP"
echo "=========================================="

# Cho phép ECS kết nối tới RDS
echo "Đang cho phép ECS kết nối tới RDS..."
aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG_ID \
    --protocol tcp \
    --port 3306 \
    --source-group $ECS_SG_ID \
    --region $AWS_REGION \
    2>/dev/null || echo "ECS to RDS rule đã tồn tại"

echo "✅ RDS Security Group đã được cập nhật!"

echo ""
echo "=========================================="
echo "BƯỚC 5.4: LẤY DANH SÁCH SUBNETS"
echo "=========================================="

SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $AWS_REGION)

SUBNET_ARRAY=($SUBNET_IDS)
echo "✅ Subnets: ${SUBNET_ARRAY[@]}"

echo ""
echo "=========================================="
echo "BƯỚC 5.5: TẠO APPLICATION LOAD BALANCER"
echo "=========================================="

echo "Đang tạo ALB: $ALB_NAME..."
echo "⏱️  Quá trình này mất 2-3 phút..."

ALB_ARN=$(aws elbv2 create-load-balancer \
    --name $ALB_NAME \
    --subnets ${SUBNET_ARRAY[@]} \
    --security-groups $ALB_SG_ID \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4 \
    --region $AWS_REGION \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text 2>/dev/null || \
    aws elbv2 describe-load-balancers \
        --names $ALB_NAME \
        --query 'LoadBalancers[0].LoadBalancerArn' \
        --output text \
        --region $AWS_REGION)

echo "✅ ALB ARN: $ALB_ARN"

# Lấy ALB DNS
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --query 'LoadBalancers[0].DNSName' \
    --output text \
    --region $AWS_REGION)

echo "✅ ALB DNS: $ALB_DNS"

echo ""
echo "=========================================="
echo "BƯỚC 5.6: TẠO TARGET GROUP"
echo "=========================================="

echo "Đang tạo Target Group: $TG_NAME..."

TG_ARN=$(aws elbv2 create-target-group \
    --name $TG_NAME \
    --protocol HTTP \
    --port 8080 \
    --vpc-id $VPC_ID \
    --target-type ip \
    --health-check-enabled \
    --health-check-protocol HTTP \
    --health-check-path /actuator/health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 3 \
    --region $AWS_REGION \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text 2>/dev/null || \
    aws elbv2 describe-target-groups \
        --names $TG_NAME \
        --query 'TargetGroups[0].TargetGroupArn' \
        --output text \
        --region $AWS_REGION)

echo "✅ Target Group ARN: $TG_ARN"

echo ""
echo "=========================================="
echo "BƯỚC 5.7: TẠO LISTENER"
echo "=========================================="

echo "Đang tạo Listener (HTTP:80)..."

LISTENER_ARN=$(aws elbv2 create-listener \
    --load-balancer-arn $ALB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$TG_ARN \
    --region $AWS_REGION \
    --query 'Listeners[0].ListenerArn' \
    --output text 2>/dev/null || \
    aws elbv2 describe-listeners \
        --load-balancer-arn $ALB_ARN \
        --query 'Listeners[0].ListenerArn' \
        --output text \
        --region $AWS_REGION)

echo "✅ Listener ARN: $LISTENER_ARN"

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 5: ALB SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin ALB:"
echo "   ALB Name: $ALB_NAME"
echo "   ALB ARN: $ALB_ARN"
echo "   ALB DNS: $ALB_DNS"
echo "   Target Group: $TG_NAME"
echo "   Target Group ARN: $TG_ARN"
echo "   ALB Security Group: $ALB_SG_ID"
echo "   ECS Security Group: $ECS_SG_ID"
echo ""
echo "📝 URL để truy cập app:"
echo "   http://$ALB_DNS"
echo "   http://$ALB_DNS/actuator/health"
echo ""
echo "⚠️  LƯU Ý: ALB đang chờ ECS tasks được deploy!"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 06-deploy.sh"
echo ""

# Lưu thông tin
cat > alb-info.txt <<EOF
ALB_NAME=$ALB_NAME
ALB_ARN=$ALB_ARN
ALB_DNS=$ALB_DNS
TG_NAME=$TG_NAME
TG_ARN=$TG_ARN
ALB_SG_ID=$ALB_SG_ID
ECS_SG_ID=$ECS_SG_ID
LISTENER_ARN=$LISTENER_ARN
EOF

echo "💾 Thông tin đã được lưu vào file: alb-info.txt"
echo ""
