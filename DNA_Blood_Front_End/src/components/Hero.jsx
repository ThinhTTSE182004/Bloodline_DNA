import React from 'react';
import { scrollToSection } from '../utils/scroll';
import { FaPlayCircle, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const Hero = () => {
  return (
    <div id="hero" className="relative min-h-screen flex items-center justify-center font-sans py-20">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/img/xet-nghiem-adn-soc-trang-1.jpg" 
          alt="DNA Testing Background" 
          className="w-full h-full object-cover filter blur-[2px] brightness-110"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-xl">
          <span className="block">Life Insurance</span>
          <span className="block">Makes You Happy</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-white font-normal leading-relaxed">
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem 
          Ipsum has been the industry's standard dummy...
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => scrollToSection('video')}
            className="px-8 py-3 bg-white text-blue-800 text-base font-semibold rounded-md shadow-lg hover:bg-blue-100 transition-all duration-300 flex items-center gap-2"
          >
            <FaPlayCircle className="w-5 h-5" />
            Watch Video
          </button>
          <button
            onClick={() => scrollToSection('learn-more')}
            className="px-8 py-3 bg-gray-800 text-white text-base font-semibold rounded-md shadow-lg hover:bg-gray-700 transition-all duration-300"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Placeholder for Illustration - You would add your image here */}
      {/* <div className="absolute bottom-0 right-0 z-0">
        <img src="/path/to/your/illustration.png" alt="Life Insurance Illustration" className="w-full" />
      </div> */}

      {/* Placeholder for Navigation Arrows - You can customize these */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button className="p-3 rounded-full bg-white text-blue-800 shadow-md hover:bg-blue-100 transition-colors duration-300">
          <FaArrowLeft className="w-6 h-6" />
        </button>
        <button className="p-3 rounded-full bg-white text-blue-800 shadow-md hover:bg-blue-100 transition-colors duration-300">
          <FaArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default Hero; 