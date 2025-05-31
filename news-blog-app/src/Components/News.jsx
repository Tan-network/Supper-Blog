import axios from "axios";
import { useEffect, useState } from "react";
import userImg from "../assets/images/avatar.jpg";
import Bookmarks from "./Bookmarks";
import Calendar from "./Calendar";
import "./News.css";
import NewsModal from "./NewsModal";
import Weather from "./Weather";

const categories = [
  "general",
  "politics",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health",
  "nation",
];
// Placeholder image URL
const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/300x150?text=No+Image+Available";

// API Key - Thay thế bằng API Key của bạn
const API_KEY = "cbbd7ae0e10a4b368b4ce2a91abf5b7d";

const News = () => {
  const [headline, setHeadline] = useState(null);
  const [news, setNews] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const [allArticles, setAllArticles] = useState([]);
  const [currentHeadlineIndex, setCurrentHeadlineIndex] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [bookmarks, setBookmarks] = useState(() => {
    // Load bookmarks from localStorage on initial render
    const savedBookmarks = localStorage.getItem('bookmarks');
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);





  const fetchNews = async (
    category = selectedCategory,
    query = searchQuery
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `https://newsapi.org/v2/top-headlines?category=${category}&lang=en&apiKey=${API_KEY}`;

      if (query) {
        url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&lang=en&apiKey=${API_KEY}`;
      }

      console.log("Fetching news from URL:", url);

      const response = await axios.get(url);
      console.log("API Response:", response.data);

      const fetchedNews = response.data.articles;
      const articlesWithImage = fetchedNews.filter(
        (article) => !!article.urlToImage
      );

      if (articlesWithImage && articlesWithImage.length > 0) {
        // Shuffle the array to get random articles
        const shuffledArticles = [...articlesWithImage].sort(() => Math.random() - 0.5);

        // Store all articles for rotation
        setAllArticles(shuffledArticles);
        setCurrentHeadlineIndex(0);

        // Set initial headline and news
        setHeadline(shuffledArticles[0]);
        setNews(shuffledArticles.slice(1, 7));
      } else {
        setHeadline(null);
        setNews([]);
        setError("Không tìm thấy bài viết có ảnh. Vui lòng thử danh mục khác.");
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      if (err.response) {
        console.error("API Error Response:", err.response.data);
        setError(
          `Lỗi API: ${err.response.data.message || "Không thể tải tin tức"}`
        );
      } else {
        setError(
          "Không thể tải tin tức. Vui lòng kiểm tra kết nối mạng và thử lại."
        );
      }
      setHeadline(null);
      setNews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allArticles.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeadlineIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % allArticles.length;
          setHeadline(allArticles[newIndex]);
          return newIndex;
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [allArticles]);

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput)
    setSearchInput("")
  };

  const handleCategoryClick = (e, category) => {
    e.preventDefault();
    setSelectedCategory(category);
    setSearchQuery("");
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article)
    setShowModal(true)
  }

  const handleBookmarksClick = (article) => {
    setBookmarks((prevBookmarks) => {
      const isBookmarked = prevBookmarks.some((bookmark) => bookmark.title === article.title);
      let newBookmarks;
      if (isBookmarked) {
        newBookmarks = prevBookmarks.filter((bookmark) => bookmark.title !== article.title);
      } else {
        newBookmarks = [...prevBookmarks, article];
      }
      // Save to localStorage whenever bookmarks change
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  }

  return (
    <div className="news">
      <header className="news-header">
        <h1 className="logo">Blog of Tan</h1>
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search News..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" disabled={isLoading}>
              <i className="fa-solid fa-magnifying-glass"></i>
            </button>
          </form>
        </div>
      </header>
      <div className="news-content">
        <div className="navbar">
          <div className="user">
            <img src={userImg} alt="User Image" />
            <p>Tan's Blog</p>
          </div>
          <nav className="categories">
            <h1 className="nav-heading">Categories</h1>
            <div className="nav-links">
              {categories.map((category) => (
                <a
                  href="#"
                  key={category}
                  className="nav-link"
                  onClick={(e) => handleCategoryClick(e,category)}
                >
                  {category}
                </a>
              ))}

              <a href="#" className="nav-link" onClick={() => setShowBookmarksModal(true)}>
                Bookmarks <i className="fa-solid fa-bookmark"></i>
              </a>
            </div>
          </nav>
        </div>
        <div className="news-section">
          {error && <p className="error-message">{error}</p>}
          {headline && (
            <div className="headline" onClick={() => handleArticleClick(headline)}>
              <img
                src={headline.urlToImage || PLACEHOLDER_IMAGE}
                alt={headline.title}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
              <h2 className="headline-title">
                {headline.title}
                <i
                  className={`${
                    bookmarks.some((bookmark) => bookmark.title === headline.title)
                      ? 'fa-solid'
                      : 'fa-regular'
                  } fa-bookmark bookmark`} onClick={(e) =>{
                    e.stopPropagation()
                    handleBookmarksClick(headline)
                  }}
                ></i>
              </h2>
            </div>
          )}
          <div className="news-grid">
            {news.map((article, index) => (
              <div key={index} className="news-grid-item"
              onClick={() => handleArticleClick(article)}>
                <img
                  src={article.urlToImage || PLACEHOLDER_IMAGE}
                  alt={article.title}
                  onError={(e) => {
                    if (e.target.src !== PLACEHOLDER_IMAGE) {
                      e.target.src = PLACEHOLDER_IMAGE;
                    }
                  }}
                />
                <h3>
                  {article.title}
                  <i
                  className={`${
                    bookmarks.some((bookmark) => bookmark.title === article.title)
                      ? 'fa-solid'
                      : 'fa-regular'
                  } fa-bookmark bookmark`} onClick={(e) =>{
                    e.stopPropagation()
                    handleBookmarksClick(article)
                  }}
                ></i>
                </h3>
              </div>
            ))}
          </div>
        </div>
        <NewsModal show={showModal} article={selectedArticle} onClose={() => setShowModal(false)} />
        <Bookmarks
          show={showBookmarksModal}
          bookmarks={bookmarks}
          onClose={() => setShowBookmarksModal(false)}
          onSelectArticle={handleArticleClick}
          onDeleteBookmark={handleBookmarksClick}/>
        <div className="my-blogs">My Blogs</div>
        <div className="weather-calendar">
          <Weather />
          <Calendar />
        </div>
      </div>
      <footer className="news-footer">Footer</footer>
    </div>
  );
};

export default News;
