import React from "react";
import { Carousel, Image } from "antd";

const ProductCarousel = () => {
  return (
    <Carousel autoplay className="mb-12 rounded-lg overflow-hidden shadow-lg">
      {[
        "https://file.hstatic.net/200000722513/file/thu_cu_doi_moi_banner_web_slider_800x400.jpg",
        "https://anphat.com.vn/media/banner/15_Aprf7e6ff1fa2a207fde50f03e329857abe.jpg",
        "https://file.hstatic.net/200000722513/file/thang_04_laptop_rtx_50series_800x400.jpg",
      ].map((url, index) => (
        <div key={index}>
          <div className="relative h-[150px] sm:h-[250px] md:h-[350px] lg:h-[400px] xl:h-[500px]">
            <Image
              src={url}
              alt={`Slide ${index + 1}`}
              preview={false}
              width="100%"
              height="100%"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
