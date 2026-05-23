function LoadingScreen() {

  return (

    <div className="loading-screen min-h-screen bg-black flex items-center justify-center overflow-hidden text-white relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 overflow-hidden">

        <div className="loading-glow glow1" />
        <div className="loading-glow glow2" />
        <div className="loading-glow glow3" />

        <div className="spotlight spotlight-left" />
        <div className="spotlight spotlight-right" />

      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-center px-6">

        <h1 className="loading-logo">

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            M
          </span>

          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            KARAOKE
          </span>

        </h1>

        <p className="loading-text">
          Preparando escenario...
        </p>

        {/* LOADER */}
        <div className="loading-bar">

          <div className="loading-progress" />

        </div>

      </div>

    </div>
  )
}

export default LoadingScreen