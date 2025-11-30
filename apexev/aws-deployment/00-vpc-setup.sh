#!/bin/bash
# ==========================================
# BƯỚC 0: SETUP VPC với PUBLIC & PRIVATE SUBNETS
# ==========================================
# Script này tạo Private Subnets cho ECS Fargate
# Theo kiến trúc: Public Subnet (ALB) + Private Subnet (ECS, RDS, Redis)

set -e

# Variables
AWS_REGION="ap-southeast-1"
VPC_ID="vpc-0135fca1db04c9138"  # Default VPC

echo "=========================================="
echo "BƯỚC 0: SETUP VPC ARCHITECTURE"
echo "=========================================="
echo ""
echo "🏗️  Kiến trúc mục tiêu:"
echo "   ┌─────────────────────────────────────┐"
echo "   │  Public Subnet (AZ-1a, AZ-1b)       │"
echo "   │  - ALB                              │"
echo "   │  - NAT Gateway (optional)           │"
echo "   └─────────────────────────────────────┘"
echo "   ┌─────────────────────────────────────┐"
echo "   │  Private Subnet (AZ-1a, AZ-1b)      │"
echo "   │  - ECS Fargate                      │"
echo "   │  - RDS MySQL                        │"
echo "   │  - ElastiCache Redis                │"
echo "   │  - VPC Endpoints                    │"
echo "   └─────────────────────────────────────┘"
echo ""

echo ""
echo "=========================================="
echo "BƯỚC 0.1: KIỂM TRA VPC HIỆN TẠI"
echo "=========================================="

# Kiểm tra VPC
VPC_CIDR=$(aws ec2 describe-vpcs \
    --vpc-ids $VPC_ID \
    --region $AWS_REGION \
    --query 'Vpcs[0].CidrBlock' \
    --output text)

echo "✅ VPC ID: $VPC_ID"
echo "✅ VPC CIDR: $VPC_CIDR"

# Lấy danh sách subnets hiện tại
echo ""
echo "📋 Subnets hiện tại:"
aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --region $AWS_REGION \
    --query 'Subnets[*].[SubnetId,CidrBlock,AvailabilityZone,MapPublicIpOnLaunch,Tags[?Key==`Name`].Value|[0]]' \
    --output table

echo ""
echo "=========================================="
echo "BƯỚC 0.2: TẠO PRIVATE SUBNETS"
echo "=========================================="

# Tạo Private Subnet trong AZ-1a
PRIVATE_SUBNET_1A_CIDR="172.31.48.0/20"
echo "Đang tạo Private Subnet 1a: $PRIVATE_SUBNET_1A_CIDR..."

PRIVATE_SUBNET_1A=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $PRIVATE_SUBNET_1A_CIDR \
    --availability-zone ap-southeast-1a \
    --region $AWS_REGION \
    --query 'Subnet.SubnetId' \
    --output text 2>/dev/null || \
    aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=$PRIVATE_SUBNET_1A_CIDR" \
        --query 'Subnets[0].SubnetId' \
        --output text \
        --region $AWS_REGION)

# Tag subnet
aws ec2 create-tags \
    --resources $PRIVATE_SUBNET_1A \
    --tags Key=Name,Value=apexev-private-1a Key=Type,Value=Private \
    --region $AWS_REGION

echo "✅ Private Subnet 1a: $PRIVATE_SUBNET_1A"

# Tạo Private Subnet trong AZ-1b
PRIVATE_SUBNET_1B_CIDR="172.31.64.0/20"
echo "Đang tạo Private Subnet 1b: $PRIVATE_SUBNET_1B_CIDR..."

PRIVATE_SUBNET_1B=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block $PRIVATE_SUBNET_1B_CIDR \
    --availability-zone ap-southeast-1b \
    --region $AWS_REGION \
    --query 'Subnet.SubnetId' \
    --output text 2>/dev/null || \
    aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=cidr-block,Values=$PRIVATE_SUBNET_1B_CIDR" \
        --query 'Subnets[0].SubnetId' \
        --output text \
        --region $AWS_REGION)

# Tag subnet
aws ec2 create-tags \
    --resources $PRIVATE_SUBNET_1B \
    --tags Key=Name,Value=apexev-private-1b Key=Type,Value=Private \
    --region $AWS_REGION

echo "✅ Private Subnet 1b: $PRIVATE_SUBNET_1B"

# Tag Public Subnets hiện tại
echo ""
echo "Đang tag Public Subnets hiện tại..."
PUBLIC_SUBNETS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" "Name=map-public-ip-on-launch,Values=true" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $AWS_REGION)

for subnet in $PUBLIC_SUBNETS; do
    aws ec2 create-tags \
        --resources $subnet \
        --tags Key=Type,Value=Public \
        --region $AWS_REGION
    echo "✅ Tagged $subnet as Public"
done

echo ""
echo "=========================================="
echo "BƯỚC 0.3: TẠO ROUTE TABLE CHO PRIVATE SUBNETS"
echo "=========================================="

# Tạo Private Route Table
PRIVATE_RT_NAME="apexev-private-rt"
echo "Đang tạo Private Route Table..."

PRIVATE_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'RouteTable.RouteTableId' \
    --output text 2>/dev/null || \
    aws ec2 describe-route-tables \
        --filters "Name=vpc-id,Values=$VPC_ID" "Name=tag:Name,Values=$PRIVATE_RT_NAME" \
        --query 'RouteTables[0].RouteTableId' \
        --output text \
        --region $AWS_REGION)

# Tag Route Table
aws ec2 create-tags \
    --resources $PRIVATE_RT_ID \
    --tags Key=Name,Value=$PRIVATE_RT_NAME Key=Type,Value=Private \
    --region $AWS_REGION

echo "✅ Private Route Table: $PRIVATE_RT_ID"

# Associate Private Subnets với Private Route Table
echo "Đang associate subnets với route table..."

aws ec2 associate-route-table \
    --route-table-id $PRIVATE_RT_ID \
    --subnet-id $PRIVATE_SUBNET_1A \
    --region $AWS_REGION \
    2>/dev/null || echo "Association 1a đã tồn tại"

aws ec2 associate-route-table \
    --route-table-id $PRIVATE_RT_ID \
    --subnet-id $PRIVATE_SUBNET_1B \
    --region $AWS_REGION \
    2>/dev/null || echo "Association 1b đã tồn tại"

echo "✅ Route Table associations hoàn thành!"

echo ""
echo "=========================================="
echo "BƯỚC 0.4: VERIFY SETUP"
echo "=========================================="

echo ""
echo "📋 Tất cả Subnets sau khi setup:"
aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --region $AWS_REGION \
    --query 'Subnets[*].[SubnetId,CidrBlock,AvailabilityZone,Tags[?Key==`Type`].Value|[0],Tags[?Key==`Name`].Value|[0]]' \
    --output table

echo ""
echo "📋 Route Tables:"
aws ec2 describe-route-tables \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --region $AWS_REGION \
    --query 'RouteTables[*].[RouteTableId,Tags[?Key==`Name`].Value|[0],Associations[*].SubnetId]' \
    --output table

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 0: VPC SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin VPC:"
echo "   VPC ID: $VPC_ID"
echo "   VPC CIDR: $VPC_CIDR"
echo ""
echo "📝 Public Subnets (cho ALB):"
for subnet in $PUBLIC_SUBNETS; do
    echo "   - $subnet"
done
echo ""
echo "📝 Private Subnets (cho ECS, RDS, Redis):"
echo "   - $PRIVATE_SUBNET_1A (ap-southeast-1a)"
echo "   - $PRIVATE_SUBNET_1B (ap-southeast-1b)"
echo ""
echo "📝 Private Route Table:"
echo "   - $PRIVATE_RT_ID"
echo ""
echo "💡 LƯU Ý:"
echo "   - Private Subnets CHƯA có route ra Internet"
echo "   - Cần VPC Endpoints để ECS truy cập AWS services"
echo "   - Hoặc cần NAT Gateway (đắt hơn)"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 03b-vpc-endpoints-setup.sh"
echo ""

# Lưu thông tin
cat > vpc-info.txt <<EOF
VPC_ID=$VPC_ID
VPC_CIDR=$VPC_CIDR
PUBLIC_SUBNETS=$PUBLIC_SUBNETS
PRIVATE_SUBNET_1A=$PRIVATE_SUBNET_1A
PRIVATE_SUBNET_1B=$PRIVATE_SUBNET_1B
PRIVATE_RT_ID=$PRIVATE_RT_ID
EOF

echo "💾 Thông tin đã được lưu vào file: vpc-info.txt"
echo ""
