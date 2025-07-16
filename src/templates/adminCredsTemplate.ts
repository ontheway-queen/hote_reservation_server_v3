import { companyName, projectName, projectURL } from "./tamplateConstants";

export const newAdminUserAccountTemp = (
  email: string,
  password: string,
  name: string
) => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome Admin</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background-color: #f5f6f8;
        color: #1f2937;
        line-height: 1.6;
      }

      .container {
        max-width: 600px;
        margin: 3rem auto;
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        overflow: hidden;
      }

      .header {
        background-color: #1e3a8a;
        color: #ffffff;
        padding: 2rem;
        text-align: center;
      }

      .header h1 {
        font-size: 1.75rem;
        margin: 0 0 0.5rem;
        font-weight: 600;
      }

      .header p {
        font-size: 1rem;
        opacity: 0.9;
        margin: 0;
      }

      .content {
        padding: 2rem;
      }

      .greeting {
        font-size: 1.125rem;
        font-weight: 500;
        margin-bottom: 1rem;
      }

      .credentials {
        background-color: #f9fafb;
        border: 1px solid #e5e7eb;
        padding: 1.5rem;
        border-radius: 6px;
        margin-top: 1.5rem;
      }

      .credentials h2 {
        font-size: 1.125rem;
        margin-bottom: 1rem;
        color: #1e40af;
        text-align: center;
      }

      .credential-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.75rem;
        font-family: monospace;
        font-size: 0.95rem;
        color: #374151;
      }

      .credential-label {
        font-weight: 500;
        color: #6b7280;
      }

      .cta-button {
        display: block;
        text-align: center;
        margin: 2rem auto 1.5rem;
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        background-color: #2563eb;
        color: #ffffff;
        border-radius: 6px;
        text-decoration: none;
        width: fit-content;
        transition: background-color 0.2s ease;
      }

      .cta-button:hover {
        background-color: #1d4ed8;
      }

      .steps {
        margin-top: 2rem;
        background-color: #fefce8;
        border: 1px solid #fde68a;
        padding: 1.25rem 1.5rem;
        border-radius: 6px;
      }

      .steps h3 {
        color: #92400e;
        font-size: 1rem;
        margin-bottom: 0.75rem;
      }

      .steps ol {
        margin: 0;
        padding-left: 1.25rem;
      }

      .steps li {
        margin-bottom: 0.5rem;
      }

      .alert {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        color: #991b1b;
        font-weight: 500;
        padding: 1rem;
        text-align: center;
        margin-top: 2rem;
        border-radius: 6px;
      }

      .footer {
        padding: 1.25rem;
        text-align: center;
        font-size: 0.875rem;
        color: #6b7280;
        background-color: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to ${projectName}</h1>
        <p>Your admin account is now active</p>
      </div>

      <div class="content">
        <p class="greeting">Hello ${name},</p>
        <p>We're pleased to inform you that your administrator account has been created. Below are your login credentials. Please take a moment to follow the security steps after login.</p>

        <div class="credentials">
          <h2>Admin Login Details</h2>
          <div class="credential-item">
            <span class="credential-label">Login URL:</span>
            <span>${projectURL}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Email:</span>
            <span>${email}</span>
          </div>
          <div class="credential-item">
            <span class="credential-label">Password:</span>
            <span>${password}</span>
          </div>
        </div>

        <a class="cta-button" href="${projectURL}?email=${email}&&password=${password}" target="_blank">
          Access Admin Dashboard
        </a>

        <div class="steps">
          <h3>Next Steps</h3>
          <ol>
            <li>Log in using the above credentials</li>
            <li>Change your temporary password immediately</li>
          </ol>
        </div>

        <div class="alert">
          ⚠️ Delete this email after logging in and securing your account.
        </div>
      </div>

      <div class="footer">
        &copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.
      </div>
    </div>
  </body>
</html>`;
};
