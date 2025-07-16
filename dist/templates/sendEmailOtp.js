"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOtpTemplate = void 0;
const tamplateConstants_1 = require("./tamplateConstants");
const sendEmailOtpTemplate = (otp, otpFor) => {
    return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${tamplateConstants_1.projectName} - Account Verification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
            position: relative;
        }
        
        .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.2; }
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .logo-container {
            margin-bottom: 20px;
        }
        
        .logo {
            width: 120px;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 300;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 45px 40px;
            background: #ffffff;
        }
        
        .security-icon {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .security-icon::before {
            content: '🔐';
            font-size: 60px;
            display: block;
            margin-bottom: 15px;
        }
        
        .main-title {
            font-size: 26px;
            font-weight: 700;
            color: #1e3c72;
            text-align: center;
            margin-bottom: 20px;
        }
        
        .description {
            font-size: 18px;
            color: #495057;
            text-align: center;
            margin-bottom: 40px;
            line-height: 1.6;
        }
        
        .otp-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            padding: 40px;
            margin: 30px 0;
            text-align: center;
            border: 2px solid #e9ecef;
            position: relative;
            overflow: hidden;
        }
        
        .otp-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(102, 126, 234, 0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
            opacity: 0.5;
        }
        
        .otp-section-content {
            position: relative;
            z-index: 2;
        }
        
        .otp-label {
            font-size: 18px;
            font-weight: 600;
            color: #1e3c72;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .otp-code {
            font-size: 48px;
            font-weight: 800;
            color: #667eea;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background: white;
            padding: 20px 30px;
            border-radius: 12px;
            border: 3px solid #667eea;
            display: inline-block;
            letter-spacing: 8px;
            margin-bottom: 20px;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
            position: relative;
        }
        
        .otp-code::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c);
            border-radius: 12px;
            z-index: -1;
            animation: borderGlow 2s ease-in-out infinite;
        }
        
        @keyframes borderGlow {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }
        
        .validity-info {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #f39c12;
            border-radius: 12px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
            position: relative;
        }
        
        .validity-info::before {
            content: '⏰';
            font-size: 24px;
            display: block;
            margin-bottom: 10px;
        }
        
        .validity-title {
            font-size: 18px;
            font-weight: 600;
            color: #b8860b;
            margin-bottom: 8px;
        }
        
        .validity-text {
            font-size: 16px;
            color: #b8860b;
            line-height: 1.5;
        }
        
        .countdown-container {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
        }
        
        .countdown-item {
            background: white;
            padding: 10px 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #f39c12;
            min-width: 60px;
        }
        
        .countdown-number {
            font-size: 20px;
            font-weight: 700;
            color: #f39c12;
            display: block;
        }
        
        .countdown-label {
            font-size: 12px;
            color: #b8860b;
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .instructions {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 16px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #667eea;
        }
        
        .instructions h3 {
            color: #1e3c72;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .instruction-list {
            list-style: none;
            padding: 0;
        }
        
        .instruction-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .instruction-item:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateX(5px);
        }
        
        .instruction-number {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 12px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .instruction-text {
            color: #2c3e50;
            font-size: 16px;
            line-height: 1.5;
        }
        
        .security-notice {
            background: linear-gradient(135deg, #ffebee 0%, #fce4ec 100%);
            border: 1px solid #e91e63;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            border-left: 5px solid #e91e63;
        }
        
        .security-notice h4 {
            color: #ad1457;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .security-notice h4::before {
            content: '🛡️';
            margin-right: 10px;
            font-size: 20px;
        }
        
        .security-notice p {
            color: #ad1457;
            margin-bottom: 10px;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            margin: 40px 0;
            border-radius: 1px;
        }
        
        .signature {
            text-align: center;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            margin-top: 30px;
        }
        
        .signature-text {
            color: #6c757d;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .signature-brand {
            font-weight: 700;
            color: #1e3c72;
            font-size: 20px;
            margin-bottom: 5px;
        }
        
        .signature-title {
            color: #6c757d;
            font-size: 14px;
            font-style: italic;
        }
        
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            text-align: center;
            padding: 30px;
            position: relative;
            overflow: hidden;
        }
        
        .footer::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="circuit" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 20h40M20 0v40M10 10h20M30 30h-20" stroke="rgba(255,255,255,0.05)" stroke-width="1" fill="none"/></pattern></defs><rect width="100" height="100" fill="url(%23circuit)"/></svg>');
        }
        
        .footer-content {
            position: relative;
            z-index: 2;
        }
        
        .footer-text {
            font-size: 16px;
            margin-bottom: 15px;
            opacity: 0.9;
        }
        
        .footer-link {
            color: #74b9ff;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            border-bottom: 2px solid transparent;
            transition: all 0.3s ease;
        }
        
        .footer-link:hover {
            border-bottom-color: #74b9ff;
        }
        
        .footer-copyright {
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.7;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 10px;
            }
            
            .email-container {
                border-radius: 16px;
            }
            
            .header, .content, .footer {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .main-title {
                font-size: 22px;
            }
            
            .otp-code {
                font-size: 36px;
                padding: 15px 20px;
                letter-spacing: 4px;
            }
            
            .countdown-container {
                flex-wrap: wrap;
                gap: 10px;
            }
            
            .countdown-item {
                min-width: 50px;
                padding: 8px 12px;
            }
            
            .instruction-item {
                flex-direction: column;
                text-align: center;
            }
            
            .instruction-number {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
        
        @media (max-width: 480px) {
            .content {
                padding: 30px 20px;
            }
            
            .otp-section {
                padding: 25px 15px;
            }
            
            .otp-code {
                font-size: 28px;
                padding: 12px 15px;
                letter-spacing: 2px;
            }
            
            .description {
                font-size: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <div class="logo-container">
                    <img src="${tamplateConstants_1.projectLogo}" alt="${tamplateConstants_1.projectName}" class="logo">
                </div>
                <h1>Account Verification</h1>
                <p class="subtitle">Secure Access Authentication</p>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Security Icon -->
            <div class="security-icon"></div>
            
            <!-- Main Title -->
            <h1 class="main-title">Verification Required</h1>
            
            <!-- Description -->
            <p class="description">
                To ensure the security of your account, please use the verification code below to ${otpFor}. This code is valid for a limited time only.
            </p>
            
            <!-- OTP Section -->
            <div class="otp-section">
                <div class="otp-section-content">
                    <div class="otp-label">Your Verification Code</div>
                    <div class="otp-code">${otp}</div>
                    <p style="color: #6c757d; font-size: 14px; margin-top: 10px;">
                        Enter this code in the verification field to proceed
                    </p>
                </div>
            </div>
            
            <!-- Validity Information -->
            <div class="validity-info">
                <div class="validity-title">Time Sensitive Code</div>
                <div class="validity-text">
                    This verification code will expire in <strong>3 minutes</strong> for your security.
                </div>
                <div class="countdown-container">
                    <div class="countdown-item">
                        <span class="countdown-number">3</span>
                        <span class="countdown-label">MIN</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number">00</span>
                        <span class="countdown-label">SEC</span>
                    </div>
                </div>
            </div>
            
            <!-- Instructions -->
            <div class="instructions">
                <h3>How to Use Your Verification Code</h3>
                <ul class="instruction-list">
                    <li class="instruction-item">
                        <span class="instruction-number">1</span>
                        <span class="instruction-text">Return to the verification page where you requested this code</span>
                    </li>
                    <li class="instruction-item">
                        <span class="instruction-number">2</span>
                        <span class="instruction-text">Enter the 6-digit code exactly as shown above</span>
                    </li>
                    <li class="instruction-item">
                        <span class="instruction-number">3</span>
                        <span class="instruction-text">Complete the verification process within 3 minutes</span>
                    </li>
                    <li class="instruction-item">
                        <span class="instruction-number">4</span>
                        <span class="instruction-text">If expired, request a new verification code</span>
                    </li>
                </ul>
            </div>
            
      
            <div class="divider"></div>
            
            <!-- Signature -->
            <div class="signature">
                <div class="signature-text">Best regards,</div>
                <div class="signature-brand">${tamplateConstants_1.projectName}</div>
                <div class="signature-title">Security Team</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-text">
                    For security questions or support, visit our website
                </div>
                <a href="${tamplateConstants_1.projectURL}" class="footer-link" target="_blank">${tamplateConstants_1.companyURL}</a>
                <div class="footer-copyright">
                    © 2025 ${tamplateConstants_1.projectName}. All rights reserved.
                </div>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
exports.sendEmailOtpTemplate = sendEmailOtpTemplate;
//# sourceMappingURL=sendEmailOtp.js.map