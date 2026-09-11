import { useEffect, useState, type FormEvent } from "react";
import { contactPageApi } from "@/api/contactPageApi";
import ContactPageView from "@/features/contact/components/ContactPageView";
import {
  defaultContactPageContent,
  type ContactPageContent,
  withContactPageFallback,
} from "@/features/contact/contactPageData";

export default function Contact() {
  const [content, setContent] = useState<ContactPageContent>(
    defaultContactPageContent,
  );

  const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.alert(content.form.successMessage);
  };

  useEffect(() => {
    let cancelled = false;

    contactPageApi
      .publicContactPage()
      .then((page) => {
        if (!cancelled) {
          setContent(withContactPageFallback(page.content));
        }
      })
      .catch((error) => {
        console.error("Contact page content request failed:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ContactPageView content={content} onSubmit={submitMessage} />
  );
}
