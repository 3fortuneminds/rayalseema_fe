import { Toaster } from "react-hot-toast";

export { default as toast } from "react-hot-toast";

export default function Toast() {
  return <Toaster position="top-right" toastOptions={{ duration: 4000 }} />;
}
