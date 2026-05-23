function StageIntro() {

  return (

    <div className="stage-intro fixed inset-0 overflow-hidden bg-black flex items-center justify-center text-white">

      {/* LUCES */}
      <div className="absolute inset-0">

        <div className="spotlight spotlight-left" />
        <div className="spotlight spotlight-right" />
        <div className="spotlight spotlight-center" />

        <div className="stage-smoke smoke1" />
        <div className="stage-smoke smoke2" />

      </div>

      {/* CONTENIDO */}
      <div className="relative z-10 text-center px-6 intro-content">

        <div className="stage-logo">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </div>

        <p className="stage-text">
          Entrando al escenario...
        </p>

      </div>

    </div>
  )
}

export default StageIntro