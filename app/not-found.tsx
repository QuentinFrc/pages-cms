import { Message } from "@/components/message";

export default function NotFound() {
  return (
    <Message
      className="absolute inset-0"
      cta="Go home"
      description={<>Could not find requested resource.</>}
      href="/"
      title="Not found."
    />
  );
}
