export default function notificationTemplate({
    from,
    message,
    actionUrl,
}: {
    from: string | null;
    message: string;
    actionUrl: string;
}) {
    return `<!DOCTYPE html>
  <html>
  <head>
     <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0 ">
    <title>Notification</title>
    <style>
      body {
        font-family: 'Helvetica', 'Arial', sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #33 3;
      }
  
      h1 {
        font-size: 24px;
        margin-bottom: 10px;
      }
  
      h2 {
        font-size: 18px;
        margin-bottom: 10px;
      }
  
      p {
        margin-bottom: 10px;
      }
  
      a {
        color: #007bff;
        text-decoration: none;
      }
  
      .container {
        max-width: 600px;
        padding : 30px;
      }
  
      .footer {
        font-size: 12px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>You have a new notification</h1>
      <p>${from} ${message}</p>
      <a href="${actionUrl}">View Notification</a>
    </div>
    <div class="footer">
      Copyright ©zeFer
    </div>
  </body>
  </html>
  `;
}
