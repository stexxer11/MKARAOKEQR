import { QRCodeCanvas } from "qrcode.react"

function TvQr({
  qrUrl,
  size = 82,
  className = "",
}) {
  if (!qrUrl) return null

  return (
    <div className={className}>
      <div
        className="
          bg-white
          p-2
          rounded-2xl
          shadow-[0_0_30px_rgba(0,0,0,0.65)]
          border border-white/30
        "
      >
        <QRCodeCanvas
          value={qrUrl}
          size={size}
        />
      </div>
    </div>
  )
}

export default TvQr