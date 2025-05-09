// src/components/common/ImageGallery.jsx
import React, { useState } from 'react';
import { Image, Carousel, Row, Col } from 'antd';

const ImageGallery = ({ images }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselRef = React.useRef();

  if (!images || images.length === 0) {
    return <Image width="100%" src="https://via.placeholder.com/600x400?text=No+Image+Available" alt="No image available" />;
  }

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
    if (carouselRef.current) {
      carouselRef.current.goTo(index);
    }
  };

  return (
    <div>
      <Carousel 
        afterChange={setCurrentImageIndex} 
        ref={carouselRef} 
        dots={images.length > 1}
        className="mb-4 rounded-lg overflow-hidden shadow-md"
      >
        {images.map((img, index) => (
          <div key={index} className="h-[400px] md:h-[500px]"> {/* Fixed height container for carousel item */}
            <Image
              preview={false} // Disable AntD's default preview to use Carousel
              width="100%"
              height="100%"
              src={img.url}
              alt={`${img.alt || 'Product Image'} ${index + 1}`}
              className="object-contain bg-gray-100" // object-contain to show full image
            />
          </div>
        ))}
      </Carousel>
      {images.length > 1 && (
        <Row gutter={[8, 8]} justify="center">
          {images.map((img, index) => (
            <Col key={index} >
              <div
                onClick={() => handleThumbnailClick(index)}
                className={`cursor-pointer border-2 p-1 rounded ${index === currentImageIndex ? 'border-blue-500' : 'border-transparent'} hover:border-blue-300`}
              >
                <Image
                  preview={false}
                  width={80}
                  height={60}
                  src={img.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="object-cover"
                />
              </div>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default ImageGallery;