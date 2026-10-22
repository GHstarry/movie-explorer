export default function MovieModal({ movie, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose}>Close</button>
        <h2>{movie.title}</h2>
        <p>{movie.overview || "No overview available."}</p>
      </div>
    </div>
  );
}