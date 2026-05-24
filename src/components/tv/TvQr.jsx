import { QRCodeCanvas } from "qrcode.react"

function TvQr({ qrUrl, large = false }) {

  if (!qrUrl) return null

  return (
    <div
      className={`
        bg-white p-4 rounded-3xl shadow-2xl
        ${large ? "scale-125" : ""}
      `}
    >
      <QRCodeCanvas
        value={qrUrl}
        size={large ? 220 : 130}
        bgColor="#ffffff"
        fgColor="#000000"
        level="H"
        includeMargin
      />
    </div>
  )
}

export default TvQr