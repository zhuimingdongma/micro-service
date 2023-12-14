import { EmailTemplateEnum } from '../enum';

export type MailProperty = {
  subject?: string;
  to?: string;
  text?: string;
  template?: EmailTemplateEnum;
};

export type CheckProperty = {
  to: string;
  captcha: string;
  template: EmailTemplateEnum;
};

export type RegisterProperty = {
  to: string;
  password: string;
  template: EmailTemplateEnum;
};
