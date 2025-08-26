export default function EventsFeed({ events }) {
  return (
    <div className="box">
      <h2 className="title is-5">Events</h2>
      {events.length === 0 ? <p>No events yet.</p> : (
        <ul>
          {events.map((e, idx) => (
            <li key={idx} className="tag is-info is-light m-1">
              {e}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
