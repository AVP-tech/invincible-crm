export function getTeamInviteEmailHtml({
  inviterName,
  workspaceName,
  inviteLink
}: {
  inviterName: string;
  workspaceName: string;
  inviteLink: string;
}) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #fcfbf8; border-radius: 12px; border: 1px solid #e2e8f0;">
      <h1 style="color: #0f172a; font-size: 24px; margin-bottom: 24px;">You've been invited!</h1>
      <p style="color: #334155; font-size: 16px; line-height: 24px;">
        <strong>${inviterName}</strong> has invited you to join their workspace <strong>${workspaceName}</strong> on Invincible CRM.
      </p>
      <p style="margin-top: 32px; margin-bottom: 32px;">
        <a href="${inviteLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </p>
      <p style="color: #64748b; font-size: 14px; line-height: 20px;">
        If you weren't expecting this invitation, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        Powered by Invincible CRM
      </p>
    </div>
  `;
}
