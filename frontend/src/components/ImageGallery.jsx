// src/components/common/ImageGallery.jsx
import React, { useState } from 'react';
import { Image } from 'antd';

const ImageGallery = ({ images = [] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);

  if (!images || images.length === 0) {
    return (
      <Image
        width="100%"
        src="https://via.placeholder.com/600x400?text=No+Image+Available"
        alt="No image available"
      />
    );
  }

  return (
    <div>
      {/* Main image */}
      <Image
        src={images[selectedImageIndex]}
        width="100%"
        height={400}
        style={{
          objectFit: 'contain',
          marginBottom: 16,
          cursor: 'pointer',
          borderRadius: 8,
          backgroundColor: '#f0f0f0',
        }}
        alt={`main-${selectedImageIndex}`}
        preview={false}
        onClick={() => setPreviewVisible(true)}
      />

      {/* Hidden Preview Group */}
      <Image.PreviewGroup
        preview={{
          visible: previewVisible,
          onVisibleChange: (vis) => setPreviewVisible(vis),
          current: selectedImageIndex,
          onChange: (index) => setSelectedImageIndex(index),
        }}
      >
        {images.map((img, idx) => (
          <Image key={idx} src={img} style={{ display: 'none' }} />
        ))}
      </Image.PreviewGroup>

      {/* Thumbnails scrollable */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          paddingBottom: 10,
          gap: 10,
          whiteSpace: 'nowrap',
        }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedImageIndex(idx)}
            style={{
              display: 'inline-block',
              border: idx === selectedImageIndex ? '2px solid #1890ff' : '1px solid #ccc',
              padding: 2,
              cursor: 'pointer',
              borderRadius: 4,
              backgroundColor: '#fff',
            }}
          >
            <Image
              src={img}
              width={70}
              height={50}
              preview={false}
              alt={`thumb-${idx}`}
              style={{
                objectFit: 'cover',
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGallery;
