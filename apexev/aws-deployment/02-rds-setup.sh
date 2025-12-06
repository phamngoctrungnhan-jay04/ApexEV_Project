#!/bin/bash
# ==========================================
# BƯỚC 2: SETUP RDS MySQL
# ==========================================
# Script này tạo RDS MySQL instance

set -e

# Variables
AWS_REGION="ap-southeast-1"
DB_INSTANCE_ID="apexev-db"
DB_INSTANCE_CLASS="db.t3.micro"  # Free Tier eligible
DB_ENGINE="mysql"
DB_ENGINE_VERSION="8.0.39"
DB_USERNAME="admin"
DB_PASSWORD="TrungNhan2024"  # ⚠️ THAY ĐỔI PASSWORD NÀY!
DB_NAME="apexev"
ALLOCATED_STORAGE="20"  # GB - Free Tier
VPC_ID="vpc-0135fca1db04c9138"  # VPC default

echo "=========================================="
echo "BƯỚC 2: SETUP RDS MySQL"
echo "=========================================="
echo ""
echo "⚠️  QUAN TRỌNG: Hãy đổi DB_PASSWORD trong script này!"
echo "   Mật khẩu hiện tại: $DB_PASSWORD"
echo ""
read -p "Bạn đã đổi password chưa? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ Hãy đổi password trong script trước khi chạy!"
    exit 1
fi

echo ""
echo "=========================================="
echo "BƯỚC 2.1: TẠO SECURITY GROUP CHO RDS"
echo "=========================================="

# Tạo Security Group cho RDS
SG_NAME="apexev-rds-sg"
SG_DESC="Security group for ApexEV RDS MySQL"

echo "Đang tạo Security Group: $SG_NAME..."
RDS_SG_ID=$(aws ec2 create-security-group \
    --group-name $SG_NAME \
    --description "$SG_DESC" \
    --vpc-id $VPC_ID \
    --region $AWS_REGION \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=$SG_NAME" \
        --query 'SecurityGroups[0].GroupId' \
        --output text \
        --region $AWS_REGION)

echo "✅ Security Group ID: $RDS_SG_ID"

# Cho phép MySQL port 3306 từ VPC
echo "Đang cấu hình inbound rules..."
aws ec2 authorize-security-group-ingress \
    --group-id $RDS_SG_ID \
    --protocol tcp \
    --port 3306 \
    --cidr 172.31.0.0/16 \
    --region $AWS_REGION \
    2>/dev/null || echo "Rule đã tồn tại, bỏ qua..."

echo "✅ Security Group đã được cấu hình!"

echo ""
echo "=========================================="
echo "BƯỚC 2.2: TẠO DB SUBNET GROUP"
echo "=========================================="

# Lấy danh sách subnets
SUBNET_IDS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --query 'Subnets[*].SubnetId' \
    --output text \
    --region $AWS_REGION)

echo "Subnets: $SUBNET_IDS"

# Tạo DB Subnet Group
DB_SUBNET_GROUP="apexev-db-subnet-group"
echo "Đang tạo DB Subnet Group: $DB_SUBNET_GROUP..."
aws rds create-db-subnet-group \
    --db-subnet-group-name $DB_SUBNET_GROUP \
    --db-subnet-group-description "Subnet group for ApexEV RDS" \
    --subnet-ids $SUBNET_IDS \
    --region $AWS_REGION \
    2>/dev/null || echo "DB Subnet Group đã tồn tại, bỏ qua..."

echo "✅ DB Subnet Group đã sẵn sàng!"

echo ""
echo "=========================================="
echo "BƯỚC 2.3: TẠO RDS MySQL INSTANCE"
echo "=========================================="

echo "Đang tạo RDS instance: $DB_INSTANCE_ID..."
echo "⏱️  Quá trình này mất 10-15 phút, vui lòng đợi..."

aws rds create-db-instance \
    --db-instance-identifier $DB_INSTANCE_ID \
    --db-instance-class $DB_INSTANCE_CLASS \
    --engine $DB_ENGINE \
    --engine-version $DB_ENGINE_VERSION \
    --master-username $DB_USERNAME \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage $ALLOCATED_STORAGE \
    --db-name $DB_NAME \
    --vpc-security-group-ids $RDS_SG_ID \
    --db-subnet-group-name $DB_SUBNET_GROUP \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00" \
    --preferred-maintenance-window "mon:04:00-mon:05:00" \
    --no-publicly-accessible \
    --storage-type gp2 \
    --region $AWS_REGION

echo ""
echo "⏳ Đang chờ RDS instance khởi động..."
echo "   Bạn có thể theo dõi tiến trình tại:"
echo "   https://ap-southeast-1.console.aws.amazon.com/rds/home?region=ap-southeast-1#databases:"

aws rds wait db-instance-available \
    --db-instance-identifier $DB_INSTANCE_ID \
    --region $AWS_REGION

echo "✅ RDS instance đã sẵn sàng!"

echo ""
echo "=========================================="
echo "BƯỚC 2.4: LẤY THÔNG TIN RDS"
echo "=========================================="

# Lấy endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_ID \
    --region $AWS_REGION \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

RDS_PORT=$(aws rds describe-db-instances \
    --db-instance-identifier $DB_INSTANCE_ID \
    --region $AWS_REGION \
    --query 'DBInstances[0].Endpoint.Port' \
    --output text)

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 2: RDS SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin RDS:"
echo "   Instance ID: $DB_INSTANCE_ID"
echo "   Endpoint: $RDS_ENDPOINT"
echo "   Port: $RDS_PORT"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USERNAME"
echo "   Password: $DB_PASSWORD"
echo ""
echo "📝 Connection String:"
echo "   jdbc:mysql://$RDS_ENDPOINT:$RDS_PORT/$DB_NAME"
echo ""
echo "⚠️  LƯU Ý: Lưu lại thông tin này để dùng cho ECS Task Definition!"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 03-s3-setup.sh"
echo ""

# Lưu thông tin vào file
cat > rds-info.txt <<EOF
RDS_ENDPOINT=$RDS_ENDPOINT
RDS_PORT=$RDS_PORT
DB_NAME=$DB_NAME
DB_USERNAME=$DB_USERNAME
DB_PASSWORD=$DB_PASSWORD
RDS_SG_ID=$RDS_SG_ID
EOF

echo "💾 Thông tin đã được lưu vào file: rds-info.txt"
echo ""
