import { PageHeader } from "@/components/page-header";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="Privacy" subtitle="Your data stays with you." />
      <section className="card-surface max-w-2xl p-8 text-[15px] leading-relaxed text-body">
        <p>
          Finlio has no account and no database. Your holdings are saved only in this browser.
        </p>
      </section>
    </>
  );
}
