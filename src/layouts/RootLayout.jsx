import PageTransition from "../components/PageTransition";
import Toast from "../components/Toast";

export default function RootLayout() {
  return (
    <div className="app-shell">
      <Toast />
      <PageTransition />
    </div>
  );
}
