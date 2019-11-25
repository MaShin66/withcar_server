import Mailgun from 'mailgun-js';

const mailGunClient = new Mailgun({
  apiKey: process.env.MAILGUN_API_KEY || "",
  domain: "sandboxc5f87f6f48844bf481845b2f9a3de547.mailgun.org"
});

// const sendEmail = (to, subject: string, html: string) => { to 를 추가하면 원하는 사람에게 발송 가능
const sendEmail = (subject: string, html: string) => {
  const emailData = {
    from: "ubiquitous6666@gmail.com",
    to: "ubiquitous6666@gmail.com",
    subject,
    html
  };
  return mailGunClient.messages().send(emailData);
};

export const sendVerificationEmail = (fullName: string, key: string) => {
  const emailSubject = `안녕하세요 ${fullName}님, 인증코드를 입력해주세요`;
  const emailBody = `인증키: ${key}`;
  return sendEmail(emailSubject, emailBody);
};