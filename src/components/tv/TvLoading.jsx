function TvLoading() {

  return (

    <div
      className="
        absolute inset-0 z-[90]
        bg-black
        flex items-center justify-center
      "
    >

      <div
        className="
          text-center
          animate-[fadeIn_0.4s_ease]
        "
      >

        <div
          className="
            w-24 h-24
            border-[5px]
            border-cyan-500/10
            border-t-cyan-400
            rounded-full
            animate-spin
            mx-auto
          "
        />

        <p
          className="
            text-white
            text-xl
            mt-10
            font-black
            tracking-[0.3em]
          "
        >
          CARGANDO
        </p>

      </div>

    </div>
  )
}

export default TvLoading