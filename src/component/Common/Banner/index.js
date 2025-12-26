import React from 'react'
import { Link } from 'react-router-dom';

const Banner = (props) => {
    const sectionStyle = props.image
        ? { backgroundImage: `url(${props.image})` }
        : props.backgroundColor
            ? { backgroundImage: 'none', backgroundColor: props.backgroundColor }
            : {};

    const textClass = props.titleColor === 'black' ? 'common_banner_text banner-text-black' : 'common_banner_text';

    return (
        <>
            <section id="common_banner_one" style={sectionStyle}>
                <div className="container ">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className={textClass}>
                                <h2>{props.title}</h2>
                                <ul>
                                    <li><Link to="/">Ana Sayfa</Link></li>
                                    <li className="slash">/</li>
                                    <li className="active">{props.title}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default Banner