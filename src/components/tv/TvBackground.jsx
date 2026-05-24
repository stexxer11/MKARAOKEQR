function TvBackground({ idle }) {

  return (

    <div className="absolute inset-0 overflow-hidden">

      {/* BASE BLACK */}
      <div className="absolute inset-0 bg-black" />

      {/* AMBIENT GLOW */}
      <div
        className="
          absolute w-[900px] h-[900px]
          bg-cyan-500/10
          blur-[180px]
          rounded-full
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          animate-pulse
        "
      />

      {/* EXTRA LIGHT ONLY IDLE */}
      {idle && (
        <div
          className="
            absolute w-[1200px] h-[1200px]
            bg-purple-500/10
            blur-[220px]
            rounded-full
            top-1/3 left-1/2
            -translate-x-1/2
            animate-[fadeIn_2s_ease]
          "
        />
      )}

    </div>
  )
}

export default TvBackground