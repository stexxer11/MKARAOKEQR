function LoginScreen({
  loginWithGoogle,
  setEnteringStage,
}) {

  return (

    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden text-white">

      {/* 🌊 LUCES AMBIENTE */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="fish fish1" />
        <div className="fish fish2" />
        <div className="fish fish3" />
        <div className="fish fish4" />
        <div className="fish fish5" />

      </div>

      {/* 🎤 LOGIN */}
      <div className="relative z-10 text-center px-6 w-full max-w-sm">

        {/* LOGO */}
        <div
          className="
            font-black
            tracking-widest
            flex
            items-end
            justify-center
            leading-none
            text-[clamp(2.5rem,10vw,4rem)]
          "
        >

          <span className="metal-m">
            M
          </span>

          <span className="metal-karaoke">
            KARAOKE
          </span>

        </div>

        <p className="text-white/70 mt-3 text-sm">
          Tu karaoke en tiempo real
        </p>

        {/* BOTON */}
        <button

          onClick={async () => {

            if (setEnteringStage) {
              setEnteringStage(true)
            }

            await new Promise(
              (r) => setTimeout(r, 200)
            )

            try {

              await loginWithGoogle()

            } catch (e) {

              if (setEnteringStage) {
                setEnteringStage(false)
              }

              console.error(e)
            }
          }}

          className="
            mt-10
            w-full
            h-12
            rounded-2xl

            bg-gradient-to-r
            from-cyan-400
            via-blue-500
            to-purple-500

            text-black
            font-black

            shadow-[0_0_60px_rgba(34,211,238,0.25)]

            active:scale-95
            transition
          "
        >

          Entrar con Google

        </button>

      </div>

    </div>
  )
}

export default LoginScreen