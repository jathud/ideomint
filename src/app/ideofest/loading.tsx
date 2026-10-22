export default function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="loading-logo-text">Ideo</span>
          <span className="loading-logo-accent">Mint</span>
        </div>
        <div className="loading-bar-track">
          <div className="loading-bar-fill" />
        </div>
      </div>
    </div>
  );
}
