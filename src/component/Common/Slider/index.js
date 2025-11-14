import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import banner1 from '../../../assets/img/banner1.png'
import banner2 from '../../../assets/img/banner2.png'
import banner3 from '../../../assets/img/banner3.png'
import banner4 from '../../../assets/img/banner4.png'
import banner5 from '../../../assets/img/banner5.png'

const Slider = () => {
    const [currentSlide, setCurrentSlide] = useState(0)
    
    // Gerçek banner resimleri - tıklanabilir linklerle
    const slides = [
        {
            id: 1,
            image: banner1,
            link: '/category/elektronik',
            external: false
        },
        {
            id: 2,
            image: banner2,
            link: '/category/bilgisayar-aksesuarlari',
            external: false
        },
        {
            id: 3,
            image: banner3,
            link: '/category/kamera-fotograf',
            external: false
        },
        {
            id: 4,
            image: banner4,
            link: '/category/genel',
            external: false
        },
        {
            id: 5,
            image: banner5,
            link: 'https://www.hepsiburada.com',
            external: true
        }
    ]

    // Otomatik slider
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000) // 5 saniyede bir değişir

        return () => clearInterval(timer)
    }, [slides.length])

    const goToSlide = (index) => {
        setCurrentSlide(index)
    }

    const goToPrevious = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    }

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
    }

    return (
        <section className="hero-slider">
            <div className="slider-container">
                <div className="slider-wrapper">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`slide ${index === currentSlide ? 'active' : ''}`}
                            style={{
                                backgroundImage: `url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            {slide.external ? (
                                <a 
                                    href={slide.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="slide-link"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 2
                                    }}
                                >
                                </a>
                            ) : (
                                <Link 
                                    to={slide.link} 
                                    className="slide-link"
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        zIndex: 2
                                    }}
                                >
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                {/* Navigation arrows */}
                <button className="slider-nav prev" onClick={goToPrevious}>
                    <i className="fa fa-chevron-left"></i>
                </button>
                <button className="slider-nav next" onClick={goToNext}>
                    <i className="fa fa-chevron-right"></i>
                </button>

                {/* Dots indicator */}
                <div className="slider-dots">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Slider
