#!/bin/bash
# ==========================================
# BƯỚC 7: VERIFY & TEST DEPLOYMENT
# ==========================================

set -e

AWS_REGION="ap-southeast-1"

echo "=========================================="
echo "BƯỚC 7: VERIFY & TEST DEPLOYMENT"
echo "=========================================="

# Load deployment info
if [ ! -f "deployment-info.txt" ]; then
    echo "❌ File deployment-info.txt không tồn tại!"
    echo "   Hãy chạy script 06-deploy.sh trước!"
    exit 1
fi

source deployment-info.txt
source alb-info.txt
source ecs-info.txt

echo ""
echo "=========================================="
echo "BƯỚC 7.1: KIỂM TRA ECS SERVICE"
echo "=========================================="

SERVICE_STATUS=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].status' \
    --output text)

RUNNING_COUNT=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].runningCount' \
    --output text)

DESIRED_COUNT=$(aws ecs describe-services \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].desiredCount' \
    --output text)

echo "Service Status: $SERVICE_STATUS"
echo "Running Tasks: $RUNNING_COUNT / $DESIRED_COUNT"

if [ "$RUNNING_COUNT" == "$DESIRED_COUNT" ]; then
    echo "✅ Tất cả tasks đang chạy!"
else
    echo "⚠️  Một số tasks chưa chạy"
fi

echo ""
echo "=========================================="
echo "BƯỚC 7.2: KIỂM TRA TARGET HEALTH"
echo "=========================================="

TARGET_HEALTH=$(aws elbv2 describe-target-health \
    --target-group-arn $TG_ARN \
    --region $AWS_REGION \
    --query 'TargetHealthDescriptions[*].[Target.Id,TargetHealth.State,TargetHealth.Reason]' \
    --output table)

echo "$TARGET_HEALTH"

HEALTHY_COUNT=$(aws elbv2 describe-target-health \
    --target-group-arn $TG_ARN \
    --region $AWS_REGION \
    --query 'length(TargetHealthDescriptions[?TargetHealth.State==`healthy`])' \
    --output text)

if [ "$HEALTHY_COUNT" -gt 0 ]; then
    echo "✅ Có $HEALTHY_COUNT target(s) healthy!"
else
    echo "⚠️  Chưa có target nào healthy"
    echo "   Đợi thêm 1-2 phút và chạy lại script này"
fi

echo ""
echo "=========================================="
echo "BƯỚC 7.3: TEST HEALTH CHECK ENDPOINT"
echo "=========================================="

echo "Đang test: $HEALTH_CHECK_URL"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL 2>/dev/null || echo "000")

if [ "$HTTP_CODE" == "200" ]; then
    echo "✅ Health check thành công! (HTTP $HTTP_CODE)"
    echo ""
    echo "Response:"
    curl -s $HEALTH_CHECK_URL | python -m json.tool 2>/dev/null || curl -s $HEALTH_CHECK_URL
else
    echo "❌ Health check thất bại! (HTTP $HTTP_CODE)"
    echo "   Có thể app chưa khởi động xong"
    echo "   Đợi thêm 1-2 phút và thử lại"
fi

echo ""
echo "=========================================="
echo "BƯỚC 7.4: TEST API ENDPOINT"
echo "=========================================="

API_TEST_URL="$API_BASE_URL/auth/login"
echo "Đang test: $API_TEST_URL"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"emailOrPhone":"test","password":"test"}' \
    $API_TEST_URL 2>/dev/null || echo "000")

if [ "$HTTP_CODE" == "401" ]; then
    echo "✅ API endpoint hoạt động! (HTTP $HTTP_CODE - Unauthorized là đúng)"
elif [ "$HTTP_CODE" == "200" ]; then
    echo "✅ API endpoint hoạt động! (HTTP $HTTP_CODE)"
else
    echo "⚠️  API response: HTTP $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "BƯỚC 7.5: KIỂM TRA LOGS"
echo "=========================================="

echo "Đang lấy logs gần nhất từ CloudWatch..."
echo ""

# Lấy log stream gần nhất
LOG_STREAM=$(aws logs describe-log-streams \
    --log-group-name $LOG_GROUP \
    --order-by LastEventTime \
    --descending \
    --max-items 1 \
    --region $AWS_REGION \
    --query 'logStreams[0].logStreamName' \
    --output text 2>/dev/null || echo "")

if [ ! -z "$LOG_STREAM" ] && [ "$LOG_STREAM" != "None" ]; then
    echo "Log Stream: $LOG_STREAM"
    echo ""
    echo "Last 20 log entries:"
    echo "---"
    aws logs get-log-events \
        --log-group-name $LOG_GROUP \
        --log-stream-name "$LOG_STREAM" \
        --limit 20 \
        --region $AWS_REGION \
        --query 'events[*].message' \
        --output text 2>/dev/null || echo "Không thể lấy logs"
else
    echo "⚠️  Chưa có logs"
fi

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH VERIFICATION"
echo "=========================================="
echo ""
echo "📊 TÓM TẮT:"
echo "   Service Status: $SERVICE_STATUS"
echo "   Running Tasks: $RUNNING_COUNT / $DESIRED_COUNT"
echo "   Healthy Targets: $HEALTHY_COUNT"
echo "   Health Check: HTTP $HTTP_CODE"
echo ""
echo "📝 URLS:"
echo "   ALB URL: $ALB_URL"
echo "   Health Check: $HEALTH_CHECK_URL"
echo "   API Base: $API_BASE_URL"
echo ""
echo "📝 AWS CONSOLE LINKS:"
echo "   ECS Service:"
echo "   https://ap-southeast-1.console.aws.amazon.com/ecs/v2/clusters/$CLUSTER_NAME/services/$SERVICE_NAME"
echo ""
echo "   CloudWatch Logs:"
echo "   https://ap-southeast-1.console.aws.amazon.com/cloudwatch/home?region=$AWS_REGION#logsV2:log-groups/log-group/\$252Fecs\$252Fapexev"
echo ""
echo "   Load Balancer:"
echo "   https://ap-southeast-1.console.aws.amazon.com/ec2/home?region=$AWS_REGION#LoadBalancers:"
echo ""
echo "🎉 DEPLOYMENT HOÀN TẤT!"
echo ""
echo "📝 Bước tiếp theo:"
echo "   1. Test các API endpoints"
echo "   2. Kiểm tra database connection"
echo "   3. Test upload file lên S3"
echo "   4. Monitor logs trên CloudWatch"
echo ""
