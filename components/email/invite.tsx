import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { siteConfig } from "@/config";

export const InviteEmailTemplate = ({
  email,
  repoName,
  inviteUrl,
  invitedByName,
  invitedByUrl,
}: {
  email: string;
  repoName: string;
  inviteUrl: string;
  invitedByName: string;
  invitedByUrl: string;
}) => {
  const baseUrl = process.env.BASE_URL
    ? process.env.BASE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "";

  return (
    <Html>
      <Head />
      <Preview>
        {invitedByName} invited you to &quot;{repoName}&quot;
      </Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans antialiased">
          <Container className="mx-auto my-[40px] max-w-[465px] rounded p-[20px]">
            <Section className="mt-[24px]">
              <Img
                alt={siteConfig.assets.logo.alt}
                className="mx-auto my-0"
                height="36"
                src={`${baseUrl}${siteConfig.assets.emailLogo}`}
                width="36"
              />
            </Section>
            <Heading className="mx-0 my-[30px] p-0 text-center font-semibold text-[#0a0a0a] text-[24px] tracking-tight">
              Join &quot;{repoName}&quot; on {siteConfig.name}
            </Heading>
            <Text className="text-[#0a0a0a] text-[16px] leading-[24px]">
              <Link
                className="rounded-md text-[#0a0a0a] underline"
                href={invitedByUrl}
              >
                {invitedByName}
              </Link>{" "}
              has invited you to the &quot;{repoName}&quot; project on {siteConfig.name}.
              Use the following link to start collaborating:
            </Text>
            <Section className="mt-[24px] mb-[24px] text-center">
              <Button
                className="rounded-lg bg-[#171717] px-5 py-3 text-center font-medium text-[14px] text-white no-underline"
                href={inviteUrl}
              >
                Join &quot;{repoName}&quot;
              </Button>
            </Section>
            <Text className="text-[#0a0a0a] text-[16px] leading-[24px]">
              or copy and paste this URL into your browser:{" "}
            </Text>
            <Text className="text-[#0a0a0a] text-[16px] leading-[24px]">
              <Link
                className="rounded-md text-[#0a0a0a] underline"
                href={inviteUrl}
              >
                {inviteUrl}
              </Link>
            </Text>
            <Text className="mt-[36px] text-[#737373] text-[14px] leading-[24px]">
              This email was intended for{" "}
              <Link
                className="text-[#737373] underline"
                href={`mailto:${email}`}
              >
                {email}
              </Link>
              . If you think this is a mistake, you can safely ignore this
              email.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
