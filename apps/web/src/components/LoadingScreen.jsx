function LoadingScreen({ label = "Loading..." }) {
  return (
    <div className="loading-screen" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingScreen;
