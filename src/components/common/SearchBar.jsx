// File: src/components/common/SearchBar.jsx
// Reusable SearchBar component - APEX Modern UI

import React from 'react';
import { FiSearch } from 'react-icons/fi';
import './SearchBar.css';

const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm...',
  buttonText = 'GO',
  className = '',
  ariaLabel = 'Tìm kiếm',
  disabled = false,
  size = 'default' // 'default' | 'compact'
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const sizeClass = size === 'compact' ? 'search-wrapper--compact' : '';

  return (
    <div className={`search-bar ${className}`}>        
      <div className={`search-wrapper ${sizeClass}`} role="search" aria-label={ariaLabel}>
        <FiSearch className="search-icon" />
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
        />
        <button
          type="button"
          className={`search-go-btn ${value?.trim() ? '' : 'idle'}`}
          onClick={() => onSearch && onSearch()}
          disabled={disabled}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
