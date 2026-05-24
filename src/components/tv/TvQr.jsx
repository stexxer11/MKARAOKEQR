import { QRCodeCanvas } from "qrcode.react"

function TvQr({ qrUrl, large = false }) {

  if (!qrUrl) return null

  const size = large ? 260 : 150

  return (

    <div
      className={`
        bg-white
        rounded-3xl
        overflow-hidden
        shadow-2xl

        ${large ? "scale-125" : ""}
      `}
      style={{
        width: size,
        height: size,
      }}
    >

      <QRCodeCanvas
        value={qrUrl}

        size={size}

        bgColor="#ffffff"
        fgColor="#000000"

        level="H"

        includeMargin={false}

        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

    </div>
  )
}

export default TvQr