import { Apple, Phone } from "lucide-react";

import { FacebookIcon, GoogleIcon } from "./BrandIcons";
import { toast } from "./Toast";

const comingSoon = (name) => () => toast(`${name} sign-in isn't available yet`);

export default function SocialAuthRow({ onGoogle }) {
  return (
    <div className="social-auth">
      <div className="social-auth-divider">
        <span>or</span>
      </div>
      <div className="social-auth-row">
        <button type="button" className="social-btn" onClick={onGoogle} aria-label="Continue with Google">
          <GoogleIcon />
        </button>
        <button type="button" className="social-btn" onClick={comingSoon("Apple")} aria-label="Continue with Apple">
          <Apple size={18} />
        </button>
        <button
          type="button"
          className="social-btn"
          onClick={comingSoon("Facebook")}
          aria-label="Continue with Facebook"
        >
          <FacebookIcon />
        </button>
        <button type="button" className="social-btn" onClick={comingSoon("Phone")} aria-label="Continue with phone">
          <Phone size={18} />
        </button>
      </div>
    </div>
  );
}
