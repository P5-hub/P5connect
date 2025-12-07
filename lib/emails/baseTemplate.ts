import { getEmailTheme } from "./theme";

export function renderBaseEmail({
  title,
  body,
  formType = "default",
}: {
  title: string;
  body: string;
  formType?: string;
}) {
  const theme = getEmailTheme(formType);

  return `
  <div style="font-family:Arial,sans-serif;background:${theme.light};padding:20px;color:#333;">
    <div style="max-width:600px;margin:0 auto;background:white;border:1px solid ${theme.border};
                border-radius:8px;overflow:hidden;">
      
      <div style="background:${theme.color};color:white;padding:16px 22px;font-size:18px;font-weight:bold;">
        ${title}
      </div>

      <div style="padding:22px;font-size:14px;line-height:1.55;color:#374151;">
        ${body}
      </div>

      <div style="padding:18px 22px;font-size:12px;color:#6B7280;border-top:1px solid ${theme.border};">
        Mit freundlichen Grüssen<br/>
        <strong>P5connect</strong>
      </div>
    </div>
  </div>
  `;
}
