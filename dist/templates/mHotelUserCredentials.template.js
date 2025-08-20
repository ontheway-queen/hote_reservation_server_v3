"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newHotelUserAccount = void 0;
const newHotelUserAccount = (email, password, name) => {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Hotel360 - Account Activation</title>
    <style type="text/css">
        /* Client-specific styles */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Reset styles */
        body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        /* Main styles */
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #2c3e50;
            background-color: #f5f7fa;
        }
        
        .email-wrapper {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
        }
        
        .header {
            background: #1e3c72;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 10px 0;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 20px;
        }
        
        .greeting {
            font-size: 18px;
            color: #1e3c72;
            margin-bottom: 20px;
            font-weight: bold;
            text-align: center;
        }
        
        .welcome-hero {
            background: #667eea;
            color: white;
            padding: 25px;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .welcome-hero h2 {
            font-size: 24px;
            margin: 0 0 15px 0;
            font-weight: bold;
        }
        
        .welcome-hero p {
            font-size: 16px;
            margin: 0;
            line-height: 1.5;
        }
        
        .stats-grid {
            width: 100%;
            margin: 20px 0;
        }
        
        .stat-card {
            display: inline-block;
            width: 30%;
            background: #f8f9fa;
            padding: 15px;
            text-align: center;
            border: 1px solid #e9ecef;
            margin: 0 1% 10px 1%;
            box-sizing: border-box;
        }
        
        .stat-number {
            font-size: 20px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #6c757d;
        }
        
        .access-section {
            background: #f8f9fa;
            padding: 20px;
            margin: 20px 0;
            border: 1px solid #dee2e6;
        }
        
        .access-section h3 {
            color: #1e3c72;
            margin: 0 0 15px 0;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
        }
        
        .platform-link {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .btn-access {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            font-size: 16px;
        }
        
        .credentials-container {
            background: white;
            padding: 20px;
            border: 1px solid #e9ecef;
        }
        
        .credentials-title {
            font-size: 18px;
            color: #1e3c72;
            margin: 0 0 15px 0;
            font-weight: bold;
            text-align: center;
        }
        
        .credential-row {
            margin-bottom: 15px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
        }
        
        .credential-label {
            font-weight: bold;
            color: #495057;
            display: inline-block;
            width: 80px;
        }
        
        .credential-value {
            color: #2c3e50;
            background: white;
            padding: 8px;
            border: 1px solid #dee2e6;
            font-family: monospace;
            font-size: 14px;
            display: inline-block;
            margin-left: 10px;
        }
        
        .instructions-section {
            background: #e3f2fd;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        
        .instructions-section h4 {
            color: #1e3c72;
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: bold;
        }
        
        .instruction-step {
            margin-bottom: 15px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.7);
        }
        
        .step-number {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: inline-block;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            margin-right: 10px;
        }
        
        .step-text {
            color: #2c3e50;
            line-height: 1.5;
            font-size: 15px;
            display: inline-block;
            vertical-align: top;
            width: calc(100% - 40px);
        }
        
        .security-alert {
            background: #fff3cd;
            border: 1px solid #f39c12;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #f39c12;
        }
        
        .security-alert h4 {
            color: #b8860b;
            margin: 0 0 10px 0;
            font-size: 18px;
            font-weight: bold;
        }
        
        .security-alert p {
            color: #b8860b;
            margin: 0 0 10px 0;
            font-size: 15px;
            line-height: 1.5;
        }
        
        .support-section {
            background: #e8f8f5;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        
        .support-section h4 {
            color: #1e3c72;
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: bold;
        }
        
        .support-item {
            display: inline-block;
            width: 30%;
            background: white;
            padding: 15px;
            border: 1px solid #d4edda;
            margin: 0 1% 10px 1%;
            box-sizing: border-box;
            vertical-align: top;
        }
        
        .support-icon {
            font-size: 20px;
            margin-bottom: 5px;
        }
        
        .support-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        
        .support-value {
            color: #007bff;
            font-size: 15px;
        }
        
        .support-value a {
            color: #007bff;
            text-decoration: none;
        }
        
        .divider {
            height: 1px;
            background: #667eea;
            margin: 30px 0;
        }
        
        .signature {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            margin-top: 20px;
        }
        
        .signature-text {
            color: #6c757d;
            font-size: 16px;
            margin-bottom: 10px;
        }
        
        .signature-name {
            font-weight: bold;
            color: #1e3c72;
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .signature-title {
            color: #6c757d;
            font-size: 14px;
            font-style: italic;
        }
        
        .footer {
            background: #2c3e50;
            color: white;
            text-align: center;
            padding: 20px;
        }
        
        .footer-brand {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #74b9ff;
        }
        
        .footer-tagline {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 15px;
        }
        
        .footer-link {
            color: #74b9ff;
            text-decoration: none;
            font-weight: bold;
            font-size: 14px;
        }
        
        .trabill-showcase {
            background: #00b894;
            color: white;
            padding: 20px;
        }
        
        .trabill-logo {
            width: 80px;
            height: auto;
            display: block;
            margin: 0 auto 15px auto;
        }
        
        .trabill-title {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 10px 0;
            text-align: center;
        }
        
        .trabill-description {
            font-size: 15px;
            margin: 0 0 15px 0;
            line-height: 1.5;
            text-align: center;
        }
        
        .trabill-cta {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-bottom: 10px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .trabill-contact {
            font-size: 14px;
            opacity: 0.9;
            text-align: center;
        }
        
        .trabill-contact strong {
            color: #fdcb6e;
        }
        
        /* Responsive styles */
        @media screen and (max-width: 600px) {
            .stat-card, .support-item {
                width: 100%;
                display: block;
                margin: 0 0 10px 0;
            }
            
            .credential-label {
                display: block;
                width: 100%;
                margin-bottom: 5px;
            }
            
            .credential-value {
                display: block;
                width: 100%;
                margin-left: 0;
            }
            
            .step-number {
                display: block;
                margin: 0 auto 10px auto;
            }
            
            .step-text {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0;">
    <!-- Email wrapper -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" valign="top">
                <table class="email-wrapper" border="0" cellpadding="0" cellspacing="0" width="650">
                    <!-- Header -->
                    <tr>
                        <td class="header" align="center">
                            <h1>Hotel Reservation Platform</h1>
                            <p class="subtitle">Enterprise Hotel Management Solution</p>
                        </td>
                    </tr>
                    
                    <!-- Main Content -->
                    <tr>
                        <td class="content" align="left">
                            <!-- Greeting -->
                            <p class="greeting">Peace and Blessings upon You</p>
                            
                            <!-- Welcome Hero Section -->
                            <table class="welcome-hero" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h2>Welcome Aboard, ${name}!</h2>
                                        <p>Your premium hotel management account has been successfully activated. You now have access to our comprehensive reservation platform designed to streamline your hospitality operations.</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Platform Statistics -->
                            <table class="stats-grid" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td class="stat-card" align="center">
                                        <div class="stat-number">24/7</div>
                                        <div class="stat-label">System Uptime</div>
                                    </td>
                                    <td class="stat-card" align="center">
                                        <div class="stat-number">100+</div>
                                        <div class="stat-label">Hotel Partners</div>
                                    </td>
                                    <td class="stat-card" align="center">
                                        <div class="stat-number">50K+</div>
                                        <div class="stat-label">Bookings Processed</div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Access Section -->
                            <table class="access-section" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h3>Access Your Management Dashboard</h3>
                                        
                                        <div class="platform-link">
                                            <a href="https://v3.hotel360.world?email=${email}&password=${password}" class="btn-access" target="_blank">
                                                Login
                                            </a>
                                        </div>
                                        
                                        <table class="credentials-container" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center">
                                                    <div class="credentials-title">Your Secure Login Credentials</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="credential-row">
                                                    <span class="credential-icon">📧</span>
                                                    <span class="credential-label">Email:</span>
                                                    <span class="credential-value">${email}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="credential-row">
                                                    <span class="credential-icon">🔐</span>
                                                    <span class="credential-label">Password:</span>
                                                    <span class="credential-value">${password}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Getting Started Instructions -->
                            <table class="instructions-section" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h4>Getting Started - Your First Steps</h4>
                                        
                                        <div class="instruction-step">
                                            <span class="step-number">1</span>
                                            <span class="step-text">Click "Launch Platform" to access your dashboard using the credentials provided above</span>
                                        </div>
                                        
                                        <div class="instruction-step">
                                            <span class="step-number">2</span>
                                            <span class="step-text">Update your password immediately for enhanced security from Account Settings</span>
                                        </div>
                                        
                                        <div class="instruction-step">
                                            <span class="step-number">3</span>
                                            <span class="step-text">Complete your hotel profile setup including property details and amenities</span>
                                        </div>
                                        
                                        <div class="instruction-step">
                                            <span class="step-number">4</span>
                                            <span class="step-text">Configure your room inventory, pricing, and availability settings</span>
                                        </div>
                                        
                                        <div class="instruction-step">
                                            <span class="step-number">5</span>
                                            <span class="step-text">Start accepting and managing reservations through our intuitive booking system</span>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Security Alert -->
                            <table class="security-alert" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td>
                                        <h4>Security & Privacy Notice</h4>
                                        <p><strong>Account Security:</strong> Your login credentials are confidential. Never share your password, OTP codes, or account details with unauthorized individuals.</p>
                                        <p><strong>Best Practices:</strong> We strongly recommend changing your password after your first login and enabling two-factor authentication for added security.</p>
                                        <p><strong>Data Protection:</strong> All your business data is encrypted and stored securely in compliance with international data protection standards.</p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Support Section -->
                            <table class="support-section" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <h4>24/7 Technical Support & Assistance</h4>
                                        <p>Our dedicated support team is available around the clock to help you succeed</p>
                                        
                                        <table class="support-grid" border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td class="support-item" align="center">
                                                    <div class="support-icon">📞</div>
                                                    <div class="support-label">Phone Support</div>
                                                    <div class="support-value">+8809638336699</div>
                                                </td>
                                                <td class="support-item" align="center">
                                                    <div class="support-icon">✉️</div>
                                                    <div class="support-label">Email Support</div>
                                                    <div class="support-value"><a href="mailto:info@m360ict.com">info@m360ict.com</a></div>
                                                </td>
                                                <td class="support-item" align="center">
                                                    <div class="support-icon">🌐</div>
                                                    <div class="support-label">Website</div>
                                                    <div class="support-value"><a href="https://www.m360ict.org" target="_blank">www.m360ict.org</a></div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <div class="divider"></div>
                            
                            <!-- Professional Signature -->
                            <table class="signature" border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center">
                                        <div class="signature-text">Warm regards,</div>
                                        <div class="signature-name">M360ICT Development Team</div>
                                        <div class="signature-title">Enterprise Solutions Division</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer" align="center">
                            <div class="footer-brand">M360ICT</div>
                            <div class="footer-tagline">Transforming Hospitality Through Technology</div>
                            <a href="https://www.m360ict.com" class="footer-link" target="_blank">www.m360ict.com</a>
                        </td>
                    </tr>
                    
                  
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
};
exports.newHotelUserAccount = newHotelUserAccount;
//# sourceMappingURL=mHotelUserCredentials.template.js.map