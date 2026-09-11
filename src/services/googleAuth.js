const CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

let scriptPromise = null;

function loadGoogleScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Prompts Google One Tap / popup sign-in and resolves with the ID token (JWT credential).
// Rejects with { unconfigured: true } if no client ID is set up yet.
export async function promptGoogleSignIn() {
  if (!CLIENT_ID) {
    throw Object.assign(new Error("Google sign-in isn't configured yet"), { unconfigured: true });
  }

  const google = await loadGoogleScript();

  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: (response) => {
        if (response?.credential) resolve(response.credential);
        else reject(new Error("Google sign-in was cancelled"));
      },
    });
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        reject(new Error("Google sign-in was cancelled"));
      }
    });
  });
}
