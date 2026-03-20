import * as React from "react";

interface EmailTemplateProps {
  fullName: string;
  email: string;
  message: string;
}

export function EmailTemplate({
  fullName,
  email,
  message,
}: EmailTemplateProps) {
  return (
    <div>
      <h1>from: {fullName}!</h1>
      <div>{email} sent you a message</div>
      <blockquote>{message}</blockquote>
    </div>
  );
}
