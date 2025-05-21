import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, className = '' }) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      // Focus vào input khi mở rộng
      setTimeout(() => {
        document.querySelector('.search-input')?.focus();
      }, 100);
    }
  };

  return (
    <div className={`search-bar ${isExpanded ? 'expanded' : ''} ${className}`}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm..."
          className="search-input"
          aria-label="Tìm kiếm bài viết"
        />
        <button
          type="button"
          className="search-toggle"
          onClick={toggleExpand}
          aria-label="Mở/đóng thanh tìm kiếm"
        >
          <i className="fas fa-search"></i>
        </button>
        <button
          type="submit"
          className="search-submit"
          aria-label="Tìm kiếm"
        >
          <i className="fas fa-arrow-right"></i>
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
