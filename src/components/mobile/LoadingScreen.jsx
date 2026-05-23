function LoadingScreen() {

  return (

    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">

      <h1 className="text-5xl font-black tracking-widest">

        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          M
        </span>

        <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
          KARAOKE
        </span>

      </h1>

      <div className="mt-8">
        <div className="w-14 h-14 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
      </div>

    </div>
  )
}

export default LoadingScreen