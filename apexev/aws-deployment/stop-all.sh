#!/bin/bash
# ==========================================
# SCRIPT: STOP ALL RESOURCES (Tiết kiệm chi phí)
# ==========================================
# Chạy script này khi NGHỈ để tắt các resources tốn tiền

set -e

AWS_REGION="ap-southeast-1"

echo "=========================================="
echo "🛑 STOP ALL RESOURCES"
echo "=========================================="
echo ""
echo "⚠️  Script này sẽ TẮT các resources sau:"
echo "   1. ECS Service (stop tasks)"
echo "   2. RDS Database (stop instance)"
echo "   3. VPC Endpoints (delete endpoints)"
echo "   4. ALB (delete load balancer)"
echo ""
echo "💰 Tiết kiệm ước tính: ~$2-3/ngày (~$60-90/tháng)"
echo ""

read -p "Bạn có chắc muốn STOP tất cả? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Đã hủy!"
    exit 0
fi

echo ""
echo "=========================================="
echo "BƯỚC 1: STOP ECS SERVICE"
echo "=========================================="

# Load ECS info
if [ -f "ecs-info.txt" ]; then
    source ecs-info.txt
    
    echo "Đang stop ECS service: apexev-service..."
    aws ecs update-service \
        --cluster $CLUSTER_NAME \
        --service apexev-service \
        --desired-count 0 \
        --region $AWS_REGION \
        2>/dev/null && echo "✅ ECS Service đã stop (desired count = 0)" || echo "⚠️  ECS Service không tồn tại"
else
    echo "⚠️  File ecs-info.txt không tồn tại, bỏ qua..."
fi

echo ""
echo "=========================================="
echo "BƯỚC 2: STOP RDS DATABASE"
echo "=========================================="

# Load RDS info
if [ -f "rds-info.txt" ]; then
    source rds-info.txt
    
    echo "Đang stop RDS instance: apexev-db..."
    aws rds stop-db-instance \
        --db-instance-identifier apexev-db \
        --region $AWS_REGION \
        2>/dev/null && echo "✅ RDS đã stop (tối đa 7 ngày)" || echo "⚠️  RDS đã stop hoặc không tồn tại"
else
    echo "⚠️  File rds-info.txt không tồn tại, bỏ qua..."
fi

echo ""
echo "=========================================="
echo "BƯỚC 3: DELETE VPC ENDPOINTS"
echo "=========================================="

# Load VPC Endpoints info
if [ -f "vpc-endpoints-info.txt" ]; then
    source vpc-endpoints-info.txt
    
    echo "Đang xóa VPC Endpoints..."
    
    # Xóa Interface Endpoints (tốn tiền)
    for endpoint_id in $ECR_API_ENDPOINT_ID $ECR_DKR_ENDPOINT_ID $LOGS_ENDPOINT_ID $SECRETS_ENDPOINT_ID $SNS_ENDPOINT_ID $BEDROCK_ENDPOINT_ID; do
        if [ ! -z "$endpoint_id" ] && [ "$endpoint_id" != "None" ]; then
            aws ec2 delete-vpc-endpoints \
                --vpc-endpoint-ids $endpoint_id \
                --region $AWS_REGION \
                2>/dev/null && echo "✅ Đã xóa endpoint: $endpoint_id" || echo "⚠️  Endpoint không tồn tại: $endpoint_id"
        fi
    done
    
    # GIỮ LẠI S3 Gateway Endpoint (FREE!)
    echo "💡 Giữ lại S3 Gateway Endpoint (miễn phí): $S3_ENDPOINT_ID"
    
else
    echo "⚠️  File vpc-endpoints-info.txt không tồn tại, bỏ qua..."
fi

echo ""
echo "=========================================="
echo "BƯỚC 4: DELETE ALB (Optional)"
echo "=========================================="

read -p "Bạn có muốn XÓA ALB không? (yes/no): " delete_alb
if [ "$delete_alb" == "yes" ]; then
    if [ -f "alb-info.txt" ]; then
        source alb-info.txt
        
        echo "Đang xóa ALB: $ALB_NAME..."
        aws elbv2 delete-load-balancer \
            --load-balancer-arn $ALB_ARN \
            --region $AWS_REGION \
            2>/dev/null && echo "✅ ALB đã xóa" || echo "⚠️  ALB không tồn tại"
        
        echo "Đang xóa Target Group: $TG_NAME..."
        sleep 5  # Đợi ALB xóa xong
        aws elbv2 delete-target-group \
            --target-group-arn $TG_ARN \
            --region $AWS_REGION \
            2>/dev/null && echo "✅ Target Group đã xóa" || echo "⚠️  Target Group không tồn tại"
    else
        echo "⚠️  File alb-info.txt không tồn tại, bỏ qua..."
    fi
else
    echo "💡 Giữ lại ALB (vẫn tốn ~$20/tháng)"
fi

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH STOP ALL"
echo "=========================================="
echo ""
echo "📝 Trạng thái sau khi stop:"
echo "   ✅ ECS Service: Stopped (desired count = 0)"
echo "   ✅ RDS: Stopped (tự động start lại sau 7 ngày)"
echo "   ✅ VPC Endpoints: Deleted (trừ S3 Gateway)"
echo "   $([ "$delete_alb" == "yes" ] && echo "✅ ALB: Deleted" || echo "⚠️  ALB: Vẫn chạy")"
echo ""
echo "💰 Chi phí còn lại:"
echo "   - ECS: $0 (không có task chạy)"
echo "   - RDS: $0 (stopped)"
echo "   - VPC Endpoints: $0 (đã xóa)"
echo "   - S3: ~$0.50/tháng (storage only)"
echo "   - ECR: $0 (< 500MB)"
echo "   - ALB: $([ "$delete_alb" == "yes" ] && echo "$0 (đã xóa)" || echo "~$20/tháng (vẫn chạy)")"
echo ""
echo "🔄 Để BẬT LẠI, chạy: bash start-all.sh"
echo ""

# Lưu timestamp
echo "STOPPED_AT=$(date)" > stop-timestamp.txt
