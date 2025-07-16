"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHotelUserAccount = void 0;
const tamplateConstants_1 = require("./tamplateConstants");
const newHotelUserAccount = (email, password, name) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ${tamplateConstants_1.projectName} - Account Activation</title>
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
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px 0;
        }
        
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        .email-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 50px 40px;
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
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .header-content {
            position: relative;
            z-index: 2;
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 12px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header .subtitle {
            font-size: 18px;
            opacity: 0.9;
            font-weight: 300;
            letter-spacing: 0.5px;
        }
        
        .content {
            padding: 45px 40px;
        }
        
        .greeting {
            font-size: 20px;
            color: #1e3c72;
            margin-bottom: 30px;
            font-weight: 600;
            text-align: center;
        }
        
        .welcome-hero {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 35px;
            border-radius: 16px;
            margin-bottom: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .welcome-hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23dots)"/></svg>');
        }
        
        .welcome-hero-content {
            position: relative;
            z-index: 2;
        }
        
        .welcome-hero h2 {
            font-size: 28px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        
        .welcome-hero p {
            font-size: 17px;
            opacity: 0.95;
            line-height: 1.6;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        
        .stat-card {
            background: #f8f9fa;
            padding: 25px 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        .stat-label {
            font-size: 14px;
            color: #6c757d;
            font-weight: 500;
        }
        
        .access-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 16px;
            padding: 35px;
            margin: 40px 0;
            border: 1px solid #dee2e6;
        }
        
        .access-section h3 {
            color: #1e3c72;
            margin-bottom: 25px;
            font-size: 24px;
            font-weight: 600;
            text-align: center;
        }
        
        .platform-link {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .btn-access {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 40px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 18px;
            transition: all 0.3s ease;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .btn-access:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
        }
        
        .credentials-container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            border: 1px solid #e9ecef;
        }
        
        .credentials-title {
            font-size: 20px;
            color: #1e3c72;
            margin-bottom: 20px;
            font-weight: 600;
            text-align: center;
        }
        
        .credential-row {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 18px;
            background: #f8f9fa;
            border-radius: 10px;
            border: 1px solid #e9ecef;
            transition: all 0.3s ease;
        }
        
        .credential-row:hover {
            background: #e9ecef;
            transform: translateX(5px);
        }
        
        .credential-icon {
            width: 20px;
            height: 20px;
            margin-right: 15px;
            color: #667eea;
        }
        
        .credential-label {
            font-weight: 600;
            color: #495057;
            min-width: 90px;
            margin-right: 20px;
        }
        
        .credential-value {
            color: #2c3e50;
            font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            flex: 1;
            border: 1px solid #dee2e6;
            font-size: 14px;
        }
        
        .instructions-section {
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
            border-radius: 16px;
            padding: 35px;
            margin: 40px 0;
            border-left: 5px solid #667eea;
        }
        
        .instructions-section h4 {
            color: #1e3c72;
            font-size: 22px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .instruction-step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 18px;
            padding: 15px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            transition: all 0.3s ease;
        }
        
        .instruction-step:hover {
            background: rgba(255, 255, 255, 0.9);
            transform: translateX(5px);
        }
        
        .step-number {
            background: #667eea;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 14px;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .step-text {
            color: #2c3e50;
            line-height: 1.6;
            font-size: 16px;
        }
        
        .security-alert {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 1px solid #f39c12;
            border-radius: 12px;
            padding: 25px;
            margin: 40px 0;
            border-left: 5px solid #f39c12;
        }
        
        .security-alert h4 {
            color: #b8860b;
            margin-bottom: 15px;
            font-size: 20px;
            font-weight: 600;
            display: flex;
            align-items: center;
        }
        
        .security-alert h4::before {
            content: '🔒';
            margin-right: 10px;
            font-size: 24px;
        }
        
        .security-alert p {
            color: #b8860b;
            margin-bottom: 10px;
            font-size: 16px;
            line-height: 1.6;
        }
        
        .support-section {
            background: linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%);
            border-radius: 16px;
            padding: 35px;
            margin: 40px 0;
            text-align: center;
        }
        
        .support-section h4 {
            color: #1e3c72;
            font-size: 22px;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .support-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 25px;
        }
        
        .support-item {
            background: white;
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #d4edda;
            transition: all 0.3s ease;
        }
        
        .support-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .support-icon {
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .support-label {
            font-weight: 600;
            color: #495057;
            margin-bottom: 5px;
        }
        
        .support-value {
            color: #007bff;
            font-size: 16px;
        }
        
        .support-value a {
            color: #007bff;
            text-decoration: none;
        }
        
        .support-value a:hover {
            text-decoration: underline;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            margin: 50px 0;
            border-radius: 1px;
        }
        
        .signature {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            margin-top: 40px;
        }
        
        .signature-text {
            color: #6c757d;
            font-size: 18px;
            margin-bottom: 15px;
        }
        
        .signature-name {
            font-weight: 700;
            color: #1e3c72;
            font-size: 20px;
            margin-bottom: 5px;
        }
        
        .signature-title {
            color: #6c757d;
            font-size: 16px;
            font-style: italic;
        }
        
        .footer {
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
            text-align: center;
            padding: 40px;
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
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="circuit" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M0 20h40M20 0v40M10 10h20M30 30h-20" stroke="rgba(255,255,255,0.03)" stroke-width="1" fill="none"/></pattern></defs><rect width="100" height="100" fill="url(%23circuit)"/></svg>');
        }
        
        .footer-content {
            position: relative;
            z-index: 2;
        }
        
        .footer-brand {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #74b9ff;
        }
        
        .footer-tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .footer-link {
            color: #74b9ff;
            text-decoration: none;
            font-weight: 500;
            font-size: 16px;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .trabill-showcase {
            background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
            color: white;
            padding: 40px;
            display: flex;
            align-items: center;
            gap: 30px;
            position: relative;
            overflow: hidden;
        }
        
        .trabill-showcase::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 8s ease-in-out infinite reverse;
        }
        
        .trabill-logo-container {
            position: relative;
            z-index: 2;
        }
        
        .trabill-logo {
            width: 100px;
            height: 75px;
            background: white;
            border-radius: 12px;
            padding: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            object-fit: contain;
        }
        
        .trabill-content {
            flex: 1;
            position: relative;
            z-index: 2;
        }
        
        .trabill-title {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .trabill-description {
            font-size: 17px;
            margin-bottom: 15px;
            opacity: 0.95;
            line-height: 1.6;
        }
        
        .trabill-cta {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin-bottom: 15px;
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .trabill-cta:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        
        .trabill-contact {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .trabill-contact strong {
            color: #fdcb6e;
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            body {
                padding: 10px 0;
            }
            
            .email-wrapper {
                margin: 0 10px;
                border-radius: 12px;
            }
            
            .header, .content, .footer, .trabill-showcase {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 26px;
            }
            
            .welcome-hero h2 {
                font-size: 24px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr 1fr;
            }
            
            .credential-row {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .credential-label {
                margin-bottom: 8px;
            }
            
            .credential-value {
                width: 100%;
            }
            
            .support-grid {
                grid-template-columns: 1fr;
            }
            
            .trabill-showcase {
                flex-direction: column;
                text-align: center;
            }
            
            .instruction-step {
                flex-direction: column;
                text-align: center;
            }
            
            .step-number {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <!-- Header -->
        <div class="header">
            <div class="header-content">
                <h1>Hotel Reservation Platform</h1>
                <p class="subtitle">Enterprise Hotel Management Solution</p>
            </div>
        </div>
        
        <!-- Main Content -->
        <div class="content">
            <!-- Greeting -->
            <div class="greeting">
                Peace and Blessings upon You
            </div>
            
            <!-- Welcome Hero Section -->
            <div class="welcome-hero">
                <div class="welcome-hero-content">
                    <h2>Welcome Aboard, ${name}!</h2>
                    <p>Your premium hotel management account has been successfully activated. You now have access to our comprehensive reservation platform designed to streamline your hospitality operations.</p>
                </div>
            </div>
            
            <!-- Platform Statistics -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">24/7</div>
                    <div class="stat-label">System Uptime</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">100+</div>
                    <div class="stat-label">Hotel Partners</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">50K+</div>
                    <div class="stat-label">Bookings Processed</div>
                </div>
            </div>
            
            <!-- Access Section -->
            <div class="access-section">
                <h3>Access Your Management Dashboard</h3>
                
                <div class="platform-link">
                    <a href="https://v3.hotel360.world?email=${email}&&password=${password}" class="btn-access" target="_blank">
                        Login Platform
                    </a>
                </div>
                
                <div class="credentials-container">
                    <div class="credentials-title">Your Secure Login Credentials</div>
                    
                    <div class="credential-row">
                        <span class="credential-icon">📧</span>
                        <span class="credential-label">Email:</span>
                        <span class="credential-value">${email}</span>
                    </div>
                    
                    <div class="credential-row">
                        <span class="credential-icon">🔐</span>
                        <span class="credential-label">Password:</span>
                        <span class="credential-value">${password}</span>
                    </div>
                </div>
            </div>
            
            <!-- Getting Started Instructions -->
            <div class="instructions-section">
                <h4>Getting Started - Your First Steps</h4>
                
                <div class="instruction-step">
                    <div class="step-number">1</div>
                    <div class="step-text">Click "Launch Platform" to access your dashboard using the credentials provided above</div>
                </div>
                
                <div class="instruction-step">
                    <div class="step-number">2</div>
                    <div class="step-text">Update your password immediately for enhanced security from Account Settings</div>
                </div>
                
                <div class="instruction-step">
                    <div class="step-number">3</div>
                    <div class="step-text">Complete your hotel profile setup including property details and amenities</div>
                </div>
                
                <div class="instruction-step">
                    <div class="step-number">4</div>
                    <div class="step-text">Configure your room inventory, pricing, and availability settings</div>
                </div>
                
                <div class="instruction-step">
                    <div class="step-number">5</div>
                    <div class="step-text">Start accepting and managing reservations through our intuitive booking system</div>
                </div>
            </div>
            
            <!-- Security Alert -->
            <div class="security-alert">
                <h4>Security & Privacy Notice</h4>
                <p><strong>Account Security:</strong> Your login credentials are confidential. Never share your password, OTP codes, or account details with unauthorized individuals.</p>
                <p><strong>Best Practices:</strong> We strongly recommend changing your password after your first login and enabling two-factor authentication for added security.</p>
                <p><strong>Data Protection:</strong> All your business data is encrypted and stored securely in compliance with international data protection standards.</p>
            </div>
            
            <!-- Support Section -->
            <div class="support-section">
                <h4>24/7 Technical Support & Assistance</h4>
                <p>Our dedicated support team is available around the clock to help you succeed</p>
                
                <div class="support-grid">
                    <div class="support-item">
                        <div class="support-icon">📞</div>
                        <div class="support-label">Phone Support</div>
                        <div class="support-value">+8809638336699</div>
                    </div>
                    
                    <div class="support-item">
                        <div class="support-icon">✉️</div>
                        <div class="support-label">Email Support</div>
                        <div class="support-value"><a href="mailto:info@m360ict.com">info@m360ict.com</a></div>
                    </div>
                    
                    <div class="support-item">
                        <div class="support-icon">🌐</div>
                        <div class="support-label">Website</div>
                        <div class="support-value"><a href="${tamplateConstants_1.projectURL}" target="_blank">www.m360ict.org</a></div>
                    </div>
                </div>
            </div>
            
            <div class="divider"></div>
            
            <!-- Professional Signature -->
            <div class="signature">
                <div class="signature-text">Warm regards,</div>
                <div class="signature-name">M360ICT Development Team</div>
                <div class="signature-title">Enterprise Solutions Division</div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-brand">M360ICT</div>
                <div class="footer-tagline">Transforming Hospitality Through Technology</div>
                <a href="${tamplateConstants_1.projectURL}" class="footer-link" target="_blank">www.m360ict.org</a>
            </div>
        </div>
        
        <!-- Trabill Showcase -->
        <div class="trabill-showcase">
            <div class="trabill-logo-container">
                <img src="https://web.trabill.app/wp-content/uploads/2024/11/logo_trabill.png" alt="Trabill Travel Management System" class="trabill-logo">
            </div>
            <div class="trabill-content">
                <h4 class="trabill-title">Trabill Travel Management System</h4>
                <p class="trabill-description">Comprehensive end-to-end software solution designed specifically for travel agencies and tour operators. Streamline your operations with our powerful booking, inventory, and customer management tools.</p>
                <a href="https://trabill.app" class="trabill-cta" target="_blank">
                    Schedule Live Demo →
                </a>
                <div class="trabill-contact">
                    <strong>Business Inquiries:</strong> +8809638336699
                </div>
            </div>
        </div>
    </div>
</body>
</html>
`;
};
exports.newHotelUserAccount = newHotelUserAccount;
//# sourceMappingURL=mHotelUserCredentials.template.js.map