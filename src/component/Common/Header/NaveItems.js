import React, { useState } from 'react'
import { Link } from 'react-router-dom';

// import Img
import banner from '../../../assets/img/common/nav_banner.png'

const NaveItems = (props) => {
    // useState hook'u component'in en üstünde olmalı
    const [activeCategory, setActiveCategory] = useState(0);
    
    // Eğer children yoksa basit link olarak göster
    if (!props.item.children) {
        return (
            <li>
                <Link to={props.item.href || "#!"}>{props.item.name}</Link>
            </li>
        )
    }

    // KATEGORİLER için özel mega menu
    if (props.item.name === "KATEGORİLER") {
        
        return (
            <li className="has-dropdown has-megaitem categories-mega-menu">
                <a href="#!" className="main-menu-link all-categories-btn">
                    <i className="fa fa-bars"></i>
                    <span>TÜM KATEGORİLER</span>
                    <i className="fa fa-angle-down"></i>
                </a>
                <div className="mega-menu categories-dropdown">
                    <div className="container">
                        <div className="categories-mega-wrapper">
                            {/* Sol tarafta kategori listesi */}
                            <div className="categories-sidebar">
                                <ul className="categories-list">
                                    {props.item.children.map((item, index) => (
                                        <li 
                                            key={index} 
                                            className={`category-list-item ${activeCategory === index ? 'active' : ''}`}
                                            data-category-index={index}
                                            onMouseEnter={() => setActiveCategory(index)}
                                        >
                                            <Link to={item.href} className="category-list-link">
                                                <i className={`fa ${item.icon || 'fa-folder-open'}`}></i>
                                                <span>{item.name}</span>
                                                <i className="fa fa-angle-right"></i>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            {/* Sağ tarafta alt kategoriler */}
                            <div className="categories-content">
                                {props.item.children.map((item, index) => (
                                    <div 
                                        key={index} 
                                        className={`category-details-panel ${activeCategory === index ? 'active' : ''}`}
                                        data-category-index={index}
                                    >
                                        <div className="category-details-header">
                                            <Link to={item.href} className="category-details-title">
                                                {item.name}
                                            </Link>
                                        </div>
                                        {item.children && item.children.length > 0 && (
                                            <div className="category-details-grid">
                                                {item.children.map((subItem, subIndex) => (
                                                    <div key={subIndex} className="category-details-item">
                                                        <Link to={subItem.href} className="category-details-link">
                                                            {subItem.name}
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </li>
        )
    }

    return (
        <>
            {props.item.mega_menu ? (
                <li className="has-dropdown has-megaitem">
                    <a href="#!">{props.item.name} <i className="fa fa-angle-down"></i></a>
                    <div className="mega-menu">
                        <ul className="mega-menu-inner">
                            {props.item.children.map((item, index) => (
                                <li className="mega-menu-item" key={index}>
                                    <p className="mega-menu-item-title">{item.name}</p>
                                    <ul className="mega-menu-sub">
                                        {item.children && item.children.map((datas, index) => (
                                            <li key={index}><Link to={datas.href}>{datas.name}</Link></li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                            <li className="mega-menu-item">
                                <div className="menu-banner">
                                    <Link to="/shop" className="menu-banner-link">
                                        <img className="menu-banner-img" src={banner} alt="img" />
                                    </Link>
                                </div>
                            </li>
                        </ul>
                    </div>
                </li>
            ) : (
                <li className="has-dropdown">
                    <a href="#!" className="main-menu-link">{props.item.name} <i className="fa fa-angle-down"></i></a>
                    <ul className="sub-menu">
                        {props.item.children.map((data, index) => (
                            <li key={index}>
                                <Link to={data.href}>{data.name}</Link>
                            </li>
                        ))}
                    </ul>
                </li>
            )}
        </>
    )
}

export default NaveItems
