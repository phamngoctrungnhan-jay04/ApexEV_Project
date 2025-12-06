#!/bin/bash
# ==========================================
# SCRIPT: START ALL RESOURCES
# ==========================================
# Chạy script này khi BẮT ĐẦU LÀM VIỆC để bật lại resources

set -e

AWS_REGION="ap-southeast-1"

echo "=========================================="
echo "🚀 START ALL RESOURCES"
echo "=========================================="
echo ""
echo "Script này sẽ BẬT LẠI các resources:"
echo "   1. RDS Database"
echo "   2. VPC Endpoints"
echo "   3. ECS Service"
echo "   4. ALB (nếu đã xóa)"
echo ""

read -p "Bạn có chắc muốn START tất cả? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Đã hủy!"
    exit 0
fi

echo ""
echo "=========================================="
echo "BƯỚC 1: START RDS DATABASE"
echo "=========================================="

# Load RDS info
if [ -f "rds-info.txt" ]; then
    source rds-info.txt
    
    echo "Đang start RDS instance: apexev-db..."
    aws rds start-db-instance \
        --db-instance-identifier apexev-db \
        --region $AWS_REGION \
        2>/dev/null && echo "✅ RDS đang khởi động..." || echo "⚠️  RDS đã chạy hoặc không tồn tại"
    
    echo "⏳ Đợi RDS available (5-10 phút)..."
    aws rds wait db-instance-available \
        --db-instance-identifier apexev-db \
        --region $AWS_REGION \
        2>/dev/null && echo "✅ RDS đã sẵn sàng!" || echo "⚠️  RDS đã available"
else
    echo "⚠️  File rds-info.txt không tồn tại, bỏ qua..."
fi

echo ""
echo "=========================================="
echo "BƯỚC 2: CREATE VPC ENDPOINTS"
echo "=========================================="

echo "Đang tạo lại VPC Endpoints..."
bash 03b-vpc-endpoints-setup.sh

echo ""
echo "=========================================="
echo "BƯỚC 3: START ECS SERVICE"
echo "=========================================="

# Load ECS info
if [ -f "ecs-info.txt" ]; then
    source ecs-info.txt
    
    echo "Đang start ECS service: apexev-service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service apexev-service \
        --desired-count 1 \
        --region $AWS_REGION \
        2>/dev/null && echo "✅ ECS Service đã start (desired count = 1)" || echo "⚠️  ECS Service không tồn tại, cần deploy lại"
    
    if [ $? -ne 0 ]; then
        echo "💡 Chạy: bash 06-deploy.sh để deploy lại ECS service"
    fi
else
    echo "⚠️  File ecs-info.txt không tồn tại, bỏ qua..."
fi

echo ""
echo "=========================================="
echo "BƯỚC 4: CHECK ALB"
echo "=========================================="

# Load ALB info
if [ -f "alb-info.txt" ]; then
    source alb-info.txt
    
    # Kiểm tra ALB có tồn tại không
    ALB_EXISTS=$(aws elbv2 describe-load-balancers \
        --load-balancer-arns $ALB_ARN \
        --region $AWS_REGION \
        --query 'LoadBalancers[0].LoadBalancerArn' \
        --output text 2>/dev/null || echo "None")
    
    if [ "$ALB_EXISTS" == "None" ]; then
        echo "⚠️  ALB không tồn tại!"
        echo "💡 Chạy: bash 05-alb-setup.sh để tạo lại ALB"
    else
        echo "✅ ALB đang chạy: $ALB_DNS"
    fi
else
    echo "⚠️  File alb-info.txt không tồn tại"
    echo "💡 Chạy: bash 05-alb-setup.sh để tạo ALB"
fi

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH START ALL"
echo "=========================================="
echo ""
echo "📝 Trạng thái sau khi start:"
echo "   ✅ RDS: Running"
echo "   ✅ VPC Endpoints: Created"
echo "   ✅ ECS Service: Running (nếu đã deploy)"
echo "   ✅ ALB: Running (nếu đã tạo)"
echo ""
echo "🌐 Truy cập ứng dụng:"
if [ -f "alb-info.txt" ]; then
    source alb-info.txt
    echo "   http://$ALB_DNS"
    echo "   http://$ALB_DNS/actuator/health"
fi
echo ""
echo "🔄 Để TẮT LẠI, chạy: bash stop-all.sh"
echo ""

# Lưu timestamp
echo "STARTED_AT=$(date)" > start-timestamp.txt
