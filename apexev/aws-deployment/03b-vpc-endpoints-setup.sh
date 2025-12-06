#!/bin/bash
# ==========================================
# BƯỚC 3B: SETUP VPC ENDPOINTS (Thay NAT Gateway)
# ==========================================
# VPC Endpoints cho phép ECS trong Private Subnet truy cập AWS services
# mà KHÔNG CẦN NAT Gateway (tiết kiệm $32/tháng)

set -e

# Variables
AWS_REGION="ap-southeast-1"
VPC_ID="vpc-0135fca1db04c9138"

echo "=========================================="
echo "BƯỚC 3B: SETUP VPC ENDPOINTS"
echo "=========================================="
echo ""
echo "💡 VPC Endpoints cho phép:"
echo "   - ECS pull image từ ECR"
echo "   - ECS ghi logs vào CloudWatch"
echo "   - ECS truy cập S3"
echo "   - KHÔNG CẦN NAT Gateway (tiết kiệm ~$32/tháng)"
echo ""

echo ""
echo "=========================================="
echo "BƯỚC 3B.1: LẤY THÔNG TIN VPC"
echo "=========================================="

# Load VPC info từ file (nếu đã chạy 00-vpc-setup.sh)
if [ -f "vpc-info.txt" ]; then
    source vpc-info.txt
    echo "✅ Đã load thông tin từ vpc-info.txt"
fi

# Lấy PRIVATE subnets ONLY (có tag Type=Private)
PRIVATE_SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Type,Values=Private" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $AWS_REGION)

if [ -z "$PRIVATE_SUBNET_IDS" ]; then
    echo "❌ KHÔNG TÌM THẤY PRIVATE SUBNETS!"
    echo "   Hãy chạy script 00-vpc-setup.sh trước!"
    exit 1
fi

PRIVATE_SUBNET_ARRAY=($PRIVATE_SUBNET_IDS)
echo "✅ Private Subnets: ${PRIVATE_SUBNET_ARRAY[@]}"

# Lấy PRIVATE Route Table ONLY (có tag Type=Private)
PRIVATE_RT_ID=$(aws ec2 describe-route-tables \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Type,Values=Private" \
    --query 'RouteTables[0].RouteTableId' \
    --output text \
    --region $AWS_REGION)

if [ -z "$PRIVATE_RT_ID" ] || [ "$PRIVATE_RT_ID" == "None" ]; then
    echo "❌ KHÔNG TÌM THẤY PRIVATE ROUTE TABLE!"
    echo "   Hãy chạy script 00-vpc-setup.sh trước!"
    exit 1
fi

echo "✅ Private Route Table: $PRIVATE_RT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.2: TẠO SECURITY GROUP CHO VPC ENDPOINTS"
echo "=========================================="

VPC_ENDPOINT_SG_NAME="apexev-vpc-endpoint-sg"
echo "Đang tạo Security Group: $VPC_ENDPOINT_SG_NAME..."

VPC_ENDPOINT_SG_ID=$(aws ec2 create-security-group \
    --group-name $VPC_ENDPOINT_SG_NAME \
    --description "Security group for VPC Endpoints" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$VPC_ENDPOINT_SG_NAME" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo "✅ VPC Endpoint Security Group ID: $VPC_ENDPOINT_SG_ID"

# Cho phép HTTPS (443) từ VPC CIDR
echo "Đang cấu hình inbound rules..."
aws ec2 authorize-security-group-ingress \
    --group-id $VPC_ENDPOINT_SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 172.31.0.0/16 \
    --region $AWS_REGION \
    2>/dev/null || echo "Rule đã tồn tại, bỏ qua..."

echo "✅ Security Group đã được cấu hình!"

echo ""
echo "=========================================="
echo "BƯỚC 3B.3: TẠO VPC ENDPOINT CHO ECR API"
echo "=========================================="
echo "📦 ECR API endpoint - Để ECS pull image metadata"

ECR_API_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.$AWS_REGION.ecr.api \
    --subnet-ids ${PRIVATE_SUBNET_ARRAY[@]} \
    --security-group-ids $VPC_ENDPOINT_SG_ID \
    --private-dns-enabled \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.ecr.api" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ ECR API Endpoint ID: $ECR_API_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.4: TẠO VPC ENDPOINT CHO ECR DKR"
echo "=========================================="
echo "📦 ECR DKR endpoint - Để ECS pull Docker image layers"

ECR_DKR_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.$AWS_REGION.ecr.dkr \
    --subnet-ids ${PRIVATE_SUBNET_ARRAY[@]} \
    --security-group-ids $VPC_ENDPOINT_SG_ID \
    --private-dns-enabled \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.ecr.dkr" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ ECR DKR Endpoint ID: $ECR_DKR_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.5: TẠO VPC ENDPOINT CHO S3"
echo "=========================================="
echo "📦 S3 Gateway endpoint - Để ECS truy cập S3 (FREE!)"

S3_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Gateway \
    --service-name com.amazonaws.$AWS_REGION.s3 \
    --route-table-ids $PRIVATE_RT_ID \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.s3" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ S3 Gateway Endpoint ID: $S3_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.6: TẠO VPC ENDPOINT CHO CLOUDWATCH LOGS"
echo "=========================================="
echo "📦 CloudWatch Logs endpoint - Để ECS ghi logs"

LOGS_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.$AWS_REGION.logs \
    --subnet-ids ${PRIVATE_SUBNET_ARRAY[@]} \
    --security-group-ids $VPC_ENDPOINT_SG_ID \
    --private-dns-enabled \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.logs" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ CloudWatch Logs Endpoint ID: $LOGS_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.7: TẠO VPC ENDPOINT CHO SECRETS MANAGER (Optional)"
echo "=========================================="
echo "📦 Secrets Manager endpoint - Để ECS lấy secrets (nếu dùng)"

SECRETS_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.$AWS_REGION.secretsmanager \
    --subnet-ids ${PRIVATE_SUBNET_ARRAY[@]} \
    --security-group-ids $VPC_ENDPOINT_SG_ID \
    --private-dns-enabled \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.secretsmanager" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ Secrets Manager Endpoint ID: $SECRETS_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.8: TẠO VPC ENDPOINT CHO SNS"
echo "=========================================="
echo "📦 SNS endpoint - Để ECS gửi notifications"

SNS_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.$AWS_REGION.sns \
    --subnet-ids ${PRIVATE_SUBNET_ARRAY[@]} \
    --security-group-ids $VPC_ENDPOINT_SG_ID \
    --private-dns-enabled \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.sns" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ SNS Endpoint ID: $SNS_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.9: TẠO VPC ENDPOINT CHO BEDROCK (Optional)"
echo "=========================================="
echo "📦 Bedrock Runtime endpoint - Để ECS gọi AI services"

BEDROCK_ENDPOINT_ID=$(aws ec2 create-vpc-endpoint \
    --vpc-id $VPC_ID \
    --vpc-endpoint-type Interface \
    --service-name com.amazonaws.$AWS_REGION.bedrock-runtime \
    --subnet-ids ${PRIVATE_SUBNET_ARRAY[@]} \
    --security-group-ids $VPC_ENDPOINT_SG_ID \
    --private-dns-enabled \
    --region $AWS_REGION \
    --query 'VpcEndpoint.VpcEndpointId' \
    --output text 2>/dev/null || \
    aws ec2 describe-vpc-endpoints \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=service-name,Values=com.amazonaws.$AWS_REGION.bedrock-runtime" \
        --query 'VpcEndpoints[0].VpcEndpointId' \
        --output text \
        --region $AWS_REGION)

echo "✅ Bedrock Runtime Endpoint ID: $BEDROCK_ENDPOINT_ID"

echo ""
echo "=========================================="
echo "BƯỚC 3B.10: VERIFY VPC ENDPOINTS"
echo "=========================================="

echo "Đang kiểm tra trạng thái VPC Endpoints..."
aws ec2 describe-vpc-endpoints \
    --vpc-endpoint-ids $ECR_API_ENDPOINT_ID $ECR_DKR_ENDPOINT_ID $S3_ENDPOINT_ID $LOGS_ENDPOINT_ID $SECRETS_ENDPOINT_ID $SNS_ENDPOINT_ID $BEDROCK_ENDPOINT_ID \
    --region $AWS_REGION \
    --query 'VpcEndpoints[*].[VpcEndpointId,ServiceName,State]' \
    --output table

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 3B: VPC ENDPOINTS SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin VPC Endpoints:"
echo "   VPC ID: $VPC_ID"
echo "   Private Subnets: ${PRIVATE_SUBNET_ARRAY[@]}"
echo "   Private Route Table: $PRIVATE_RT_ID"
echo "   Security Group: $VPC_ENDPOINT_SG_ID"
echo ""
echo "📝 Endpoints đã tạo:"
echo "   ✅ ECR API: $ECR_API_ENDPOINT_ID"
echo "   ✅ ECR DKR: $ECR_DKR_ENDPOINT_ID"
echo "   ✅ S3 Gateway: $S3_ENDPOINT_ID (FREE!)"
echo "   ✅ CloudWatch Logs: $LOGS_ENDPOINT_ID"
echo "   ✅ Secrets Manager: $SECRETS_ENDPOINT_ID"
echo "   ✅ SNS: $SNS_ENDPOINT_ID"
echo "   ✅ Bedrock Runtime: $BEDROCK_ENDPOINT_ID"
echo ""
echo "� CHI  PHÍ VPC ENDPOINTS:"
echo "   - Interface Endpoints: ~$0.01/giờ × 6 = $0.06/giờ = $43.80/tháng"
echo "   - Data transfer: $0.01/GB"
echo "   - S3 Gateway Endpoint: MIỄN PHÍ"
echo "   - Tổng ước tính: ~$44/tháng"
echo ""
echo "💡 TIẾT KIỆM CHI PHÍ:"
echo "   - Xóa Bedrock nếu không dùng AI: Tiết kiệm $7/tháng"
echo "   - Xóa Secrets Manager nếu không dùng: Tiết kiệm $7/tháng"
echo "   - Chỉ giữ: ECR API, ECR DKR, S3, Logs: ~$22/tháng"
echo ""
echo "🔄 TẮT/BẬT HÀNG NGÀY:"
echo "   - Chạy 'bash stop-endpoints.sh' khi nghỉ"
echo "   - Chạy 'bash 03b-vpc-endpoints-setup.sh' khi làm việc"
echo "   - Tiết kiệm: ~$30/tháng (chỉ chạy 8h/ngày)"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 04-ecs-setup.sh"
echo ""

# Lưu thông tin
cat > vpc-endpoints-info.txt <<EOF
VPC_ID=$VPC_ID
VPC_ENDPOINT_SG_ID=$VPC_ENDPOINT_SG_ID
ECR_API_ENDPOINT_ID=$ECR_API_ENDPOINT_ID
ECR_DKR_ENDPOINT_ID=$ECR_DKR_ENDPOINT_ID
S3_ENDPOINT_ID=$S3_ENDPOINT_ID
LOGS_ENDPOINT_ID=$LOGS_ENDPOINT_ID
SECRETS_ENDPOINT_ID=$SECRETS_ENDPOINT_ID
SNS_ENDPOINT_ID=$SNS_ENDPOINT_ID
BEDROCK_ENDPOINT_ID=$BEDROCK_ENDPOINT_ID
PRIVATE_SUBNET_ARRAY="${PRIVATE_SUBNET_ARRAY[@]}"
PRIVATE_RT_ID=$PRIVATE_RT_ID
EOF

echo "💾 Thông tin đã được lưu vào file: vpc-endpoints-info.txt"
echo ""
