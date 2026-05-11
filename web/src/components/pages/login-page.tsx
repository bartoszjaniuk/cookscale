import { useTranslation } from "react-i18next";
import { LoginForm } from "@/components/login-form";

export function LoginPage() {
  const { t } = useTranslation();

  const features = [
    t("AUTH.LOGIN_FEATURE_1"),
    t("AUTH.LOGIN_FEATURE_2"),
    t("AUTH.LOGIN_FEATURE_3"),
  ];

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-5 md:px-8 py-8 md:py-20">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
        {/* Left — editorial copy */}
        <div className="hidden lg:block">
          <p
            className="text-[13px] uppercase tracking-widest"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("AUTH.WELCOME_BACK")}
          </p>
          <h1 className="mt-4">
            {t("AUTH.LOGIN_HEADING")}{" "}
            <em className="italic font-light">{t("AUTH.LOGIN_HEADING_EM")}</em>
          </h1>
          <p
            className="mt-6 text-[17px] max-w-md"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {t("AUTH.LOGIN_DESC")}
          </p>
          <ul
            className="mt-10 space-y-4 text-[15px]"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--color-primary)" }}
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Right — interactive login form */}
        <LoginForm />
      </div>
    </main>
  );
}
