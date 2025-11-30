#!/bin/bash
# ==========================================
# BƯỚC 4: SETUP ECS CLUSTER & TASK DEFINITION
# ==========================================

set -e

# Variables
AWS_REGION="ap-southeast-1"
AWS_ACCOUNT_ID="029930584678"
CLUSTER_NAME="apexev-cluster"
TASK_FAMILY="apexev-task"
ECR_IMAGE="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/apexev:latest"

echo "=========================================="
echo "BƯỚC 4: SETUP ECS CLUSTER"
echo "=========================================="

# Load RDS info
if [ ! -f "rds-info.txt" ]; then
    echo "❌ File rds-info.txt không tồn tại!"
    echo "   Hãy chạy script 02-rds-setup.sh trước!"
    exit 1
fi

source rds-info.txt

# Load S3 info
if [ ! -f "s3-info.txt" ]; then
    echo "❌ File s3-info.txt không tồn tại!"
    echo "   Hãy chạy script 03-s3-setup.sh trước!"
    exit 1
fi

source s3-info.txt

echo ""
echo "=========================================="
echo "BƯỚC 4.1: TẠO ECS CLUSTER"
echo "=========================================="

echo "Đang tạo ECS cluster: $CLUSTER_NAME..."
aws ecs create-cluster \
    --cluster-name $CLUSTER_NAME \
    --region $AWS_REGION \
    2>/dev/null || echo "Cluster đã tồn tại, bỏ qua..."

echo "✅ ECS Cluster đã sẵn sàng!"

echo ""
echo "=========================================="
echo "BƯỚC 4.2: TẠO IAM ROLES"
echo "=========================================="

# Tạo Task Execution Role
EXECUTION_ROLE_NAME="ecsTaskExecutionRole-apexev"
echo "Đang tạo Task Execution Role..."

cat > /tmp/ecs-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

EXECUTION_ROLE_ARN=$(aws iam create-role \
    --role-name $EXECUTION_ROLE_NAME \
    --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
    --query 'Role.Arn' \
    --output text 2>/dev/null || \
    aws iam get-role --role-name $EXECUTION_ROLE_NAME --query 'Role.Arn' --output text)

# Attach policies
aws iam attach-role-policy \
    --role-name $EXECUTION_ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy \
    2>/dev/null || true

echo "✅ Execution Role ARN: $EXECUTION_ROLE_ARN"

# Tạo Task Role (cho S3 access)
TASK_ROLE_NAME="ecsTaskRole-apexev"
echo "Đang tạo Task Role..."

TASK_ROLE_ARN=$(aws iam create-role \
    --role-name $TASK_ROLE_NAME \
    --assume-role-policy-document file:///tmp/ecs-trust-policy.json \
    --query 'Role.Arn' \
    --output text 2>/dev/null || \
    aws iam get-role --role-name $TASK_ROLE_NAME --query 'Role.Arn' --output text)

# Attach S3 policy
aws iam attach-role-policy \
    --role-name $TASK_ROLE_NAME \
    --policy-arn $S3_POLICY_ARN \
    2>/dev/null || true

echo "✅ Task Role ARN: $TASK_ROLE_ARN"

echo ""
echo "=========================================="
echo "BƯỚC 4.3: TẠO CLOUDWATCH LOG GROUP"
echo "=========================================="

LOG_GROUP="/ecs/apexev"
echo "Đang tạo CloudWatch Log Group: $LOG_GROUP..."
aws logs create-log-group \
    --log-group-name $LOG_GROUP \
    --region $AWS_REGION \
    2>/dev/null || echo "Log Group đã tồn tại, bỏ qua..."

echo "✅ Log Group đã sẵn sàng!"

echo ""
echo "=========================================="
echo "BƯỚC 4.4: TẠO TASK DEFINITION"
echo "=========================================="

# Tạo Task Definition JSON
cat > /tmp/task-definition.json <<EOF
{
  "family": "$TASK_FAMILY",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "$EXECUTION_ROLE_ARN",
  "taskRoleArn": "$TASK_ROLE_ARN",
  "containerDefinitions": [
    {
      "name": "apexev-container",
      "image": "$ECR_IMAGE",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "SPRING_PROFILES_ACTIVE",
          "value": "prod"
        },
        {
          "name": "DB_URL",
          "value": "jdbc:mysql://$RDS_ENDPOINT:$RDS_PORT/$DB_NAME?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
        },
        {
          "name": "DB_USERNAME",
          "value": "$DB_USERNAME"
        },
        {
          "name": "DB_PASSWORD",
          "value": "$DB_PASSWORD"
        },
        {
          "name": "JWT_SECRET",
          "value": "ApexEV-Production-JWT-Secret-2024-Change-This!"
        },
        {
          "name": "SERVER_PORT",
          "value": "8080"
        },
        {
          "name": "AWS_REGION",
          "value": "$AWS_REGION"
        },
        {
          "name": "S3_BUCKET_NAME",
          "value": "$BUCKET_NAME"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "$LOG_GROUP",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
EOF

echo "Đang register Task Definition..."
TASK_DEF_ARN=$(aws ecs register-task-definition \
    --cli-input-json file:///tmp/task-definition.json \
    --region $AWS_REGION \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)

echo "✅ Task Definition ARN: $TASK_DEF_ARN"

echo ""
echo "=========================================="
echo "✅ HOÀN THÀNH BƯỚC 4: ECS SETUP"
echo "=========================================="
echo ""
echo "📝 Thông tin ECS:"
echo "   Cluster: $CLUSTER_NAME"
echo "   Task Definition: $TASK_FAMILY"
echo "   Task Definition ARN: $TASK_DEF_ARN"
echo "   Execution Role: $EXECUTION_ROLE_ARN"
echo "   Task Role: $TASK_ROLE_ARN"
echo "   Log Group: $LOG_GROUP"
echo ""
echo "⚠️  LƯU Ý: Task Definition chứa DB password!"
echo "   Trong production, nên dùng AWS Secrets Manager"
echo ""
echo "🎯 Bước tiếp theo: Chạy script 05-alb-setup.sh"
echo ""

# Lưu thông tin
cat > ecs-info.txt <<EOF
CLUSTER_NAME=$CLUSTER_NAME
TASK_FAMILY=$TASK_FAMILY
TASK_DEF_ARN=$TASK_DEF_ARN
EXECUTION_ROLE_ARN=$EXECUTION_ROLE_ARN
TASK_ROLE_ARN=$TASK_ROLE_ARN
LOG_GROUP=$LOG_GROUP
EOF

echo "💾 Thông tin đã được lưu vào file: ecs-info.txt"
echo ""

# Cleanup
rm -f /tmp/ecs-trust-policy.json /tmp/task-definition.json
