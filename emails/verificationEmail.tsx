export const verificationEmailHtml = (otp: string) => `
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <title>Verification Code</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Roboto Font -->
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap"
      rel="stylesheet"
    />

    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Roboto', Verdana, sans-serif;
        background-color: #f5f5f5;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        padding: 24px;
        border-radius: 8px;
      }
      h2 {
        margin-bottom: 16px;
      }
      p {
        font-size: 14px;
        line-height: 1.6;
        color: #333333;
      }
      .otp {
        font-size: 22px;
        font-weight: bold;
        letter-spacing: 4px;
        margin: 16px 0;
      }
      .footer {
        margin-top: 24px;
        font-size: 12px;
        color: #777777;
      }
    </style>
  </head>

  <body>
    <!-- Preview text (hidden in body, visible in inbox preview) -->
    <span style="display:none;">
      Here's your verification code: ${otp}
    </span>

    <div class="container">
      <h2>Hello Dear,</h2>

      <p>
        Thank you for registering. Please use the following verification code to
        complete your registration:
      </p>

      <p class="otp">${otp}</p>

      <p>
        If you did not request this code, please ignore this email.
      </p>

      <div class="footer">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
