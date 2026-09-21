import { DEFAULT_LOCALE } from "@/lib/locale";
import { HomePage, homeMetadata } from "./home-page";

export const generateMetadata = () => homeMetadata(DEFAULT_LOCALE);

export default function Home() {
  return <HomePage locale={DEFAULT_LOCALE} />;
}
