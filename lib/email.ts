import nodemailer from "nodemailer";

type OrderEmail = {
  orderNumber: string;
  customerEmail: string;
  total: number;
  items: Array<{ name: string; quantity: number; total: number }>;
};

type OrderStatusEmail = {
  orderNumber: string;
  customerEmail: string;
  status: string;
};

async function sendMail(to: string, subject: string, text: string) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASSWORD || !to) {
    console.warn("Email skipped: SMTP configuration or recipient is missing.");
    return false;
  }
  const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT ?? 587), secure: Number(SMTP_PORT ?? 587) === 465, auth: { user: SMTP_USER, pass: SMTP_PASSWORD } });
  await transporter.sendMail({ from: SMTP_FROM ?? SMTP_USER, to, subject, text });
  return true;
}

export async function sendOrderConfirmationEmail(order: OrderEmail) {
  return sendMail(order.customerEmail, `MOTEVRA order ${order.orderNumber} received`, [
      `Thank you for your MOTEVRA order ${order.orderNumber}.`,
      "",
      ...order.items.map((item) => `${item.name} x ${item.quantity}: PKR ${item.total.toLocaleString()}`),
      "",
      `Total: PKR ${order.total.toLocaleString()}`,
      "Your order is now processing. We will send another update when it is delivered.",
    ].join("\n"));
}

export function sendOrderStatusEmail(order: OrderStatusEmail) {
  return sendMail(order.customerEmail, `MOTEVRA order ${order.orderNumber} is ${order.status.toLowerCase()}`, `Your MOTEVRA order ${order.orderNumber} is now ${order.status.toLowerCase()}.`);
}
