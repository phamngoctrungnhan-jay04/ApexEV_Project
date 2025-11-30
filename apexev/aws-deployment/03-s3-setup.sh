#!/bin/bash
# ==========================================
# BƯỚC 3: SETUP S3 BUCKET
# ==========================================
# Script này tạo S3 bucket để lưu ảnh/video

set -e

# Variables
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="029930584678"
BUCKET_NAME="apexev-media-$AWS_ACCOUNT_ID"

echo "=========================================="
echo "BƯỚC 3: SETUP S3 BUCKET"
echo "=========================================="

echo ""
echo "=========================================="
echo "BƯỚC 3.1: TẠO S3 BUCKET"
echo "=========================================="

# Tạo S3 bucket
echo "Đang tạo S3 bucket: $BUCKET_NAME..."
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION 2>/dev/null || \
    echo "Bucket đã tồn tại, bỏ qua..."

echo "✅ S3 bucket đã sẵn sàng!"

echo ""
echo "=========================================="
echo "BƯỚC 3.2: CẤU HÌNH CORS"
echo "=========================================="

# Tạo CORS configuration
cat > /tmp/s3-cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

echo "Đang cấu hình CORS..."
aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file:///tmp/s3-cors.json

echo "✅ CORS đã được cấu hình!"

echo ""
echo "=========================================="
echo "BƯỚC 3.3: CẤU HÌNH LIFECYCLE POLICY"
echo "=========================================="

# Tạo Lifecycle policy (xóa file cũ sau 90 ngày)
cat > /tmp/s3-lifecycle.json <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldFiles",
      "Status": "Enabled",
      "Filter": {
        "Prefix": "temp/"
      },
      "Expiration": {
        "Days": 90
      }
    }
  ]
}
EOF

echo "Đang cấu hình Lifecycle policy..."
aws s3api put-bucket-lifecycle-configuration \
    --bucket $BUCKET_NAME \
    --lifecycle-configuration file:///tmp/s3-lifecycle.json

echo "✅ Lifecycle policy đã được cấu hình!"

echo ""
echo "=========================================="
echo "BƯỚC 3.4: CẤU HÌNH PUBLIC ACCESS BLOCK"
echo "=========================================="

# Block public access (bảo mật)
echo "Đang cấu hình public access block..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
        "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

echo "✅ Public access đã được block!"

echo ""
echo "=========================================="
echo "BƯỚC 3.5: TẠO IAM POLICY CHO S3"
echo "=========================================="

# Tạo IAM policy cho ECS task
POLICY_NAME="ApexEV-S3-Access-Policy"
cat > /tmp/s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::$BUCKET_NAME",
        "arn:aws:s3:::$BUCKET_NAME/*"
      ]
    }
  ]
}
EOF

echo "Đang tạo IAM policy: $POLICY_NAME..."
POLICY_ARN=$(aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/s3-policy.json \
    --query 'Policy.Arn' \
    --output text 2>/dev/null || \
    aws iam list-policies \
        --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" \
        --output text)

echo "✅ IAM Policy ARN: $POLICY_ARN"

echo ""
echo "=========================================="
echo "BƯỚC 3.6: TEST UPLOAD FILE"
echo "=========================================="

# Test upload
echo "Đang test upload file..."
echo "Test file from ApexEV deployment" > /tmp/test.txt
aws s3 cp /tmp/test.txt s3://$BUCKET_NAME/test.txt

echo "Đang test download file..."
aws s3 cp s3://$BUCKET_NAME/test.txt /tmp/test-download.txt

if diff /tmp/test.txt /tmp/test-download.txt > /dev/null; then
    echo "✅ Upload/Download test thành công!"
    aws s3 rm s3://$BUCKET_NAME/test.txt
else
    echo "❌ Upload/Download test thất bại!"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 3: S3 SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin S3:"
echo "   Bucket Name: $BUCKET_NAME"
echo "   Region: $AWS_REGION"
echo "   IAM Policy ARN: $POLICY_ARN"
echo ""
echo "📝 S3 URL Format:"
echo "   https://$BUCKET_NAME.s3.$AWS_REGION.amazonaws.com/<file-key>"
echo ""
echo "⚠️  LƯU Ý: Lưu lại Policy ARN để attach vào ECS Task Role!"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 04-ecs-setup.sh"
echo ""

# Lưu thông tin vào file
cat > s3-info.txt <<EOF
BUCKET_NAME=$BUCKET_NAME
S3_POLICY_ARN=$POLICY_ARN
EOF

echo "💾 Thông tin đã được lưu vào file: s3-info.txt"
echo ""

# Cleanup
rm -f /tmp/s3-cors.json /tmp/s3-lifecycle.json /tmp/s3-policy.json /tmp/test.txt /tmp/test-download.txt
