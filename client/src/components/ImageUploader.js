import React, { useState, useRef, useEffect } from 'react';

const ImageUploader = ({ onImageSelected, currentImage }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  const containerRef = useRef(null);

  // Khởi tạo với hình ảnh hiện tại (nếu có)
  useEffect(() => {
    if (currentImage) {
      setPreview(currentImage);
    }
  }, [currentImage]);

  // Xử lý file ảnh sau khi chọn
  const handleImageFile = (file) => {
    if (!file || !file.type.match('image.*')) return;

    setImage(file);

    // Tạo URL preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageSelected(file, reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Browse file
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  // Click vào vùng kéo thả sẽ mở dialog chọn file
  const handleAreaClick = () => {
    fileInputRef.current.click();
  };

  // Xử lý kéo thả
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Xử lý paste từ clipboard - cải tiến để hoạt động mọi lúc
  useEffect(() => {
    const handlePaste = (e) => {
      // Kiểm tra xem phần tử đang focus có phải là thẻ input hoặc textarea không
      const activeElement = document.activeElement;
      const isInputOrTextarea =
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA';

      // Nếu người dùng đang focus vào một phần tử input hoặc textarea,
      // không xử lý paste để không ảnh hưởng đến hành vi nhập liệu
      if (isInputOrTextarea) {
        return;
      }

      // Xử lý paste từ clipboard
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        handleImageFile(file);
        e.preventDefault();
      }
    };

    // Thêm focus vào vùng drop area khi click vào container
    const handleContainerClick = () => {
      if (!preview && dropAreaRef.current) {
        dropAreaRef.current.focus();
      }
    };

    window.addEventListener('paste', handlePaste);

    if (containerRef.current) {
      containerRef.current.addEventListener('click', handleContainerClick);
    }

    return () => {
      window.removeEventListener('paste', handlePaste);

      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleContainerClick);
      }
    };
  }, [preview]);

  // Xóa ảnh đã chọn
  const handleRemoveImage = (e) => {
    e.stopPropagation(); // Ngăn không cho click lan ra ngoài
    setImage(null);
    setPreview('');
    onImageSelected(null, '');

    // Reset input file để có thể chọn lại file cũ
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-uploader" ref={containerRef}>
      <div
        className={`upload-area ${dragActive ? 'drag-active' : ''} ${preview ? 'has-preview' : ''}`}
        onClick={preview ? null : handleAreaClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        ref={dropAreaRef}
        tabIndex="0"
      >
        {!preview ? (
          <div className="upload-placeholder">
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Kéo thả hình ảnh vào đây hoặc click để chọn</p>
            <p className="upload-hint">Bạn cũng có thể dán (Ctrl+V) hình ảnh ở bất kỳ đâu</p>
          </div>
        ) : (
          <div className="image-preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={handleRemoveImage}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="image/*"
          className="file-input"
        />
      </div>
      <div className="upload-instructions">
        <p>Hỗ trợ: JPG, JPEG, PNG, GIF (Max: 5MB)</p>
      </div>
    </div>
  );
};

export default ImageUploader;
