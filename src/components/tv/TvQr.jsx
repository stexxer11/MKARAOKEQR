import { QRCodeCanvas } from "qrcode.react"

function TvQr({ qrUrl, large = false }) {

  if (!qrUrl) return null

  const size = large ? 260 : 150

  return (

    <div
      className={`
        bg-white
        p-2
        rounded-3xl
        overflow-hidden
        shadow-2xl

        ${large ? "scale-125" : ""}
      `}
    >

      <QRCodeCanvas
        value={qrUrl}

        size={size}

        bgColor="#ffffff"
        fgColor="#000000"

        level="H"

        includeMargin={false}

        style={{
          width: size,
          height: size,
          display: "block",
          borderRadius: "18px",
        }}
      />

    </div>
  )
}

export default TvQr