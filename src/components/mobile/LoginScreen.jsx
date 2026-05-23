function LoginScreen({
  loginWithGoogle,
}) {

  return (

    <div className="min-h-screen bg-black flex items-center justify-center text-white">

      <div className="text-center px-6 w-full max-w-sm">

        <h1 className="text-5xl font-black tracking-widest">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </h1>

        <button
          onClick={loginWithGoogle}
          className="
            mt-10 w-full h-12 rounded-2xl
            bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
            text-black font-black
          "
        >
          Entrar con Google
        </button>

      </div>

    </div>
  )
}

export default LoginScreen