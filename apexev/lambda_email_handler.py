"""
AWS Lambda Function để xử lý email events từ SNS
Nhận message từ SNS Topic và gửi email qua SES
"""

import json
import boto3
import logging
from datetime import datetime

# Cấu hình logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Khởi tạo SES client
ses_client = boto3.client('ses', region_name='ap-southeast-1')

# Email templates
EMAIL_TEMPLATES = {
    'REGISTRATION_CONFIRMATION': {
        'subject': 'Xác nhận đăng ký tài khoản ApexEV',
        'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .otp-box {{ background-color: #e7f3ff; border: 2px solid #007bff; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }}
        .otp {{ font-size: 48px; font-weight: bold; color: #007bff; letter-spacing: 10px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ApexEV - Xác nhận tài khoản</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản ApexEV!</p>
            <p>Để hoàn tất quá trình đăng ký, vui lòng nhập mã OTP dưới đây:</p>
            <div class="otp-box">
                <div class="otp">{otp}</div>
            </div>
            <p><strong>Lưu ý:</strong> Mã OTP này sẽ hết hạn sau 10 phút.</p>
            <p>Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        '''
    },
    'APPOINTMENT_CONFIRMATION': {
        'subject': 'Xác nhận đặt lịch hẹn - ApexEV',
        'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .info-box {{ background-color: #f0f8ff; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Xác nhận đặt lịch hẹn</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Lịch hẹn của bạn đã được xác nhận thành công!</p>
            <div class="info-box">
                <p><strong>Ngày hẹn:</strong> {appointmentDate}</p>
                <p><strong>Xe:</strong> {vehicleInfo}</p>
                <p><strong>Dịch vụ:</strong> {serviceType}</p>
            </div>
            <p>Vui lòng đến đúng giờ. Nếu bạn cần thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi sớm nhất.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        '''
    },
    'APPOINTMENT_REMINDER': {
        'subject': 'Nhắc nhở: Cuộc hẹn của bạn sắp tới - ApexEV',
        'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .info-box {{ background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Nhắc nhở cuộc hẹn</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Đây là nhắc nhở về cuộc hẹn sắp tới của bạn:</p>
            <div class="info-box">
                <p><strong>Ngày:</strong> {appointmentDate}</p>
                <p><strong>Giờ:</strong> {appointmentTime}</p>
                <p><strong>Xe:</strong> {vehicleInfo}</p>
            </div>
            <p>Vui lòng đến đúng giờ. Cảm ơn bạn!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        '''
    },
    'PAYMENT_CONFIRMATION': {
        'subject': 'Xác nhận thanh toán - ApexEV',
        'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .invoice-box {{ background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 5px; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✓ Xác nhận thanh toán</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Cảm ơn bạn đã thanh toán!</p>
            <div class="invoice-box">
                <p><strong>Hóa đơn:</strong> {invoiceNumber}</p>
                <p><strong>Số tiền:</strong> {amount} VND</p>
                <p><strong>Ngày thanh toán:</strong> {paymentDate}</p>
            </div>
            <p>Hóa đơn của bạn đã được lưu. Vui lòng giữ email này để tham khảo.</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        '''
    },
    'PAYMENT_THANK_YOU_PICKUP_REMINDER': {
        'subject': 'Cảm ơn bạn! Nhắc nhở lấy xe - ApexEV',
        'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .info-box {{ background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 15px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Cảm ơn bạn!</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Dịch vụ của bạn đã hoàn thành. Vui lòng lấy xe của bạn.</p>
            <div class="info-box">
                <p><strong>Hóa đơn:</strong> {invoiceNumber}</p>
                <p><strong>Xe:</strong> {vehicleInfo}</p>
                <p><strong>Chi tiết dịch vụ:</strong> {serviceDetails}</p>
            </div>
            <p>Cảm ơn bạn đã sử dụng dịch vụ của ApexEV!</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        '''
    },
    'PICKUP_SCHEDULE_REMINDER': {
        'subject': 'Nhắc nhở: Đặt lịch lấy xe tại ApexEV',
        'html': '''
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f5f5f5; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; }}
        .header {{ background-color: #6f42c1; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }}
        .content {{ padding: 20px; }}
        .button {{ display: inline-block; background-color: #6f42c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Đặt lịch lấy xe</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{fullName}</strong>,</p>
            <p>Xe của bạn đã sẵn sàng. Vui lòng đặt lịch lấy xe:</p>
            <p><strong>Xe:</strong> {vehicleInfo}</p>
            <div style="text-align: center;">
                <a href="{appointmentScheduleLink}" class="button">Đặt lịch lấy xe</a>
            </div>
            <p>Hoặc copy link này: {appointmentScheduleLink}</p>
        </div>
        <div class="footer">
            <p>&copy; 2025 ApexEV Garage Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        '''
    }
}


def lambda_handler(event, context):
    """
    Lambda handler để xử lý SNS events
    
    Event structure:
    {
        'Records': [
            {
                'Sns': {
                    'Message': '{"type": "...", "email": "...", ...}'
                }
            }
        ]
    }
    """
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Parse SNS message
        sns_message = event['Records'][0]['Sns']['Message']
        message = json.loads(sns_message)
        
        logger.info(f"Processing email type: {message.get('type')}")
        
        # Lấy thông tin cần thiết
        email = message.get('email')
        email_type = message.get('type')
        
        # Validate email
        if not email:
            logger.error("Email address not provided")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Email address not provided'})
            }
        
        # Lấy template
        template = EMAIL_TEMPLATES.get(email_type)
        if not template:
            logger.error(f"Unknown email type: {email_type}")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Unknown email type: {email_type}'})
            }
        
        # Thay thế placeholder trong HTML
        html_body = template['html']
        for key, value in message.items():
            if value is not None:
                # Thay thế {key} bằng value
                html_body = html_body.replace('{' + key + '}', str(value))
        
        # Gửi email qua SES
        try:
            response = ses_client.send_email(
                Source='apexevcompany@gmail.com',  # Phải là verified email
                Destination={
                    'ToAddresses': [email]
                },
                Message={
                    'Subject': {
                        'Data': template['subject'],
                        'Charset': 'UTF-8'
                    },
                    'Body': {
                        'Html': {
                            'Data': html_body,
                            'Charset': 'UTF-8'
                        }
                    }
                }
            )
            
            logger.info(f"Email sent successfully. MessageId: {response['MessageId']}")
            
            return {
                'statusCode': 200,
                'body': json.dumps({
                    'message': 'Email sent successfully',
                    'messageId': response['MessageId']
                })
            }
            
        except ses_client.exceptions.MessageRejected as e:
            logger.error(f"SES rejected the message: {str(e)}")
            return {
                'statusCode': 400,
                'body': json.dumps({'error': f'Message rejected: {str(e)}'})
            }
        except Exception as e:
            logger.error(f"Error sending email via SES: {str(e)}")
            raise
        
    except KeyError as e:
        logger.error(f"Missing required field in event: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f'Missing required field: {str(e)}'})
        }
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse SNS message: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({'error': f'Invalid JSON in SNS message: {str(e)}'})
        }
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }
