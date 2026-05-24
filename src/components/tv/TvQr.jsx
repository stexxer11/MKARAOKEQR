import { QRCodeCanvas } from "qrcode.react"

function TvQr({ qrUrl }) {

  return (

    <div
      className="
        absolute bottom-5 right-5 z-40
        transition-all duration-500
      "
    >

      <div
        className="
          bg-white/95
          backdrop-blur-xl
          p-3 rounded-[1.6rem]
          shadow-[0_0_40px_rgba(0,0,0,0.45)]
          border border-white/20
        "
      >

        {qrUrl && (

          <QRCodeCanvas
            value={qrUrl}
            size={95}
          />

        )}

      </div>

    </div>
  )
}

export default TvQr