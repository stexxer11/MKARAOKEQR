import supabase from "./supabase"

export async function loginWithGoogle() {

  const redirectTo =
    import.meta.env.DEV
      ? "http://localhost:5173"
      : window.location.origin

  await supabase.auth.signInWithOAuth({

    provider: "google",

    options: {
      redirectTo
    }

  })
}

export async function logout() {
  await supabase.auth.signOut()
}