"""
AWS Lambda Function: Email Handler
Triggered by SNS Topic (apexev-email-events)
Sends emails via AWS SES
"""

import json
import boto3
import logging
from datetime import datetime

# Initialize AWS clients
sns_client = boto3.client('sns', region_name='ap-southeast-1')
ses_client = boto3.client('ses', region_name='ap-southeast-1')

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Email templates
EMAIL_TEMPLATES = {
    'REGISTRATION_CONFIRMATION': {
        'subject': 'Xác nhận đăng ký tài khoản ApexEV',
        'html': '''
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Chào mừng đến với ApexEV!</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận email của bạn bằng cách click vào link dưới đây:</p>
                    <p><a href="{confirmationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Xác nhận Email</a></p>
                    <p>Link này sẽ hết hạn sau 24 giờ.</p>
                    <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
                </body>
            </html>
        '''
    },
    'APPOINTMENT_CONFIRMATION': {
        'subject': 'Xác nhận đặt lịch hẹn - ApexEV',
        'html': '''
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Xác nhận đặt lịch hẹn</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Lịch hẹn của bạn đã được xác nhận thành công!</p>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Ngày hẹn:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{appointmentDate}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Xe:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{vehicleInfo}</td>
                        </tr>
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Dịch vụ:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{serviceType}</td>
                        </tr>
                    </table>
                    <p>Vui lòng đến đúng giờ. Nếu bạn cần hủy hoặc thay đổi lịch hẹn, vui lòng liên hệ với chúng tôi sớm nhất có thể.</p>
                    <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
                </body>
            </html>
        '''
    },
    'APPOINTMENT_REMINDER': {
        'subject': 'Nhắc nhở: Cuộc hẹn của bạn sắp tới - ApexEV',
        'html': '''
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Nhắc nhở cuộc hẹn</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Đây là lời nhắc nhở rằng bạn có cuộc hẹn sắp tới:</p>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Ngày:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{appointmentDate}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Giờ:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{appointmentTime}</td>
                        </tr>
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Xe:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{vehicleInfo}</td>
                        </tr>
                    </table>
                    <p>Vui lòng đến đúng giờ. Cảm ơn!</p>
                    <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
                </body>
            </html>
        '''
    },
    'PAYMENT_CONFIRMATION': {
        'subject': 'Xác nhận thanh toán - ApexEV',
        'html': '''
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Xác nhận thanh toán</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ của ApexEV. Thanh toán của bạn đã được xác nhận thành công!</p>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Số hóa đơn:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{invoiceNumber}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Số tiền:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{amount:,.0f} VNĐ</td>
                        </tr>
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Ngày thanh toán:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{paymentDate}</td>
                        </tr>
                    </table>
                    <p>Chúng tôi rất trân trọng sự tin tưởng của bạn. Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi.</p>
                    <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
                </body>
            </html>
        '''
    },
    'PAYMENT_THANK_YOU_PICKUP_REMINDER': {
        'subject': 'Cảm ơn bạn! Nhắc nhở lấy xe - ApexEV',
        'html': '''
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Cảm ơn bạn đã sử dụng dịch vụ ApexEV!</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Thanh toán của bạn đã được xác nhận thành công. Chúng tôi rất cảm ơn sự tin tưởng của bạn!</p>
                    <h3>Thông tin hóa đơn:</h3>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Số hóa đơn:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{invoiceNumber}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Xe:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{vehicleInfo}</td>
                        </tr>
                    </table>
                    <h3>Dịch vụ đã thực hiện:</h3>
                    <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 10px; border-left: 4px solid #007bff;">{serviceDetails}</p>
                    <h3>Nhắc nhở lấy xe:</h3>
                    <p>Xe của bạn đã sẵn sàng để lấy. Vui lòng liên hệ với chúng tôi để sắp xếp thời gian lấy xe hoặc đặt lịch lấy xe tại trung tâm.</p>
                    <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
                </body>
            </html>
        '''
    },
    'PICKUP_SCHEDULE_REMINDER': {
        'subject': 'Nhắc nhở: Đặt lịch lấy xe tại ApexEV',
        'html': '''
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2>Bảo dưỡng xe của bạn đã hoàn thành!</h2>
                    <p>Xin chào {fullName},</p>
                    <p>Chúng tôi vui mừng thông báo rằng bảo dưỡng xe của bạn đã hoàn thành thành công!</p>
                    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
                        <tr style="background-color: #f2f2f2;">
                            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Xe:</strong></td>
                            <td style="border: 1px solid #ddd; padding: 8px;">{vehicleInfo}</td>
                        </tr>
                    </table>
                    <h3>Bước tiếp theo:</h3>
                    <p>Vui lòng đặt lịch lấy xe tại trung tâm ApexEV. Bạn có thể đặt lịch trực tiếp bằng cách click vào nút dưới đây:</p>
                    <p style="text-align: center; margin: 20px 0;">
                        <a href="{appointmentScheduleLink}" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">Đặt Lịch Lấy Xe</a>
                    </p>
                    <p>Hoặc bạn có thể liên hệ trực tiếp với chúng tôi để sắp xếp thời gian lấy xe phù hợp.</p>
                    <p>Cảm ơn bạn đã sử dụng dịch vụ của ApexEV!</p>
                    <p>Trân trọng,<br/>Đội ngũ ApexEV</p>
                </body>
            </html>
        '''
    }
}

def lambda_handler(event, context):
    """
    Main Lambda handler function
    Triggered by SNS Topic
    """
    try:
        logger.info(f"Received event: {json.dumps(event)}")
        
        # Parse SNS message
        for record in event['Records']:
            sns_message = json.loads(record['Sns']['Message'])
            
            email_type = sns_message.get('type')
            email = sns_message.get('email')
            
            logger.info(f"Processing email: type={email_type}, recipient={email}")
            
            # Get template
            template = EMAIL_TEMPLATES.get(email_type)
            if not template:
                logger.error(f"Unknown email type: {email_type}")
                continue
            
            # Format HTML body
            html_body = template['html'].format(**sns_message)
            
            # Send email via SES
            send_email_via_ses(
                recipient=email,
                subject=template['subject'],
                html_body=html_body
            )
            
            logger.info(f"Email sent successfully to {email}")
        
        return {
            'statusCode': 200,
            'body': json.dumps('Emails sent successfully')
        }
        
    except Exception as e:
        logger.error(f"Error processing email: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f'Error: {str(e)}')
        }

def send_email_via_ses(recipient, subject, html_body):
    """
    Send email using AWS SES
    """
    try:
        response = ses_client.send_email(
            Source='noreply@apexev.com',  # Verified email in SES
            Destination={
                'ToAddresses': [recipient]
            },
            Message={
                'Subject': {
                    'Data': subject,
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
        
        logger.info(f"SES response: {response['MessageId']}")
        return response
        
    except Exception as e:
        logger.error(f"Error sending email via SES: {str(e)}")
        raise
