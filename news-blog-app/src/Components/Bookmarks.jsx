import demoImg from "../assets/images/demo.jpg";
import "./Bookmarks.css";
import "./Modal.css";

const Bookmarks = ({show, bookmarks, onClose, onSelectArticle, onDeleteBookmark}) => {
    if (!show){
        return null
    }
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <span className="close-button" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </span>
        <h2 className="bookmarks-heading">Bookmarked News</h2>
        <div className="bookmarks-list">
          {bookmarks && bookmarks.length > 0 ? (
            bookmarks.map((bookmark, index) => (
              <div key={index} className="bookmark-item" onClick={() => onSelectArticle(bookmark)}>
                <img
                  src={bookmark.urlToImage || demoImg}
                  alt={bookmark.title}
                  onError={(e) => {
                    e.target.src = demoImg;
                  }}
                />
                <h3>{bookmark.title}</h3>
                <span
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteBookmark(bookmark);
                  }}
                >
                  <i className="fa-regular fa-circle-xmark"></i>
                </span>
              </div>
            ))
          ) : (
            <p>No bookmarks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Bookmarks;
