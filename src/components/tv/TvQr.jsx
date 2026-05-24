import { QRCodeCanvas } from "qrcode.react"

function TvQr({
  qrUrl,
  size = 95,
  className = "",
}) {
  return (
    <div className={className}>
      <div
        className="
          bg-white/95
          p-2
          rounded-2xl
          shadow-[0_0_35px_rgba(0,0,0,0.55)]
          border border-white/20
        "
      >
        {qrUrl && (
          <QRCodeCanvas
            value={qrUrl}
            size={size}
          />
        )}
      </div>
    </div>
  )
}

export default TvQr