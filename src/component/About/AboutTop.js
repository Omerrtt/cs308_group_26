import React from 'react'
// import img
import img1 from '../../assets/img/common/img-about.jpg'

const AboutTop = () => {
    return (
        <>
            <section id="about-top" className="ptb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                            <div className="about_top_img">
                                <img src={img1} alt="img" />
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-12 col-sm-12 col-12">
                            <div className="about_top_left_content">
                                <h2>HAKKIMIZDA - Malikane Electronics Mağazası</h2>
                                <h4>Dijital dünyada var olan her projenin bir fikrin sonucu olduğuna ve her fikrin bir nedeni olduğuna inanıyoruz.</h4>
                                <p><strong>Malikane Electronics</strong> çok satıcılı B2C hızlı e-ticaret şirketidir. Şirket öncelikle elektronik ürünlere odaklanır, ancak aynı zamanda
                                    diğer elektronik aksesuarlar, cihazlar ve teknoloji ürünleri de sunmaktadır. <strong>Malikane Electronics</strong> öncelikle Türkiye, Avrupa, Amerika, Avustralya ve
                                    Orta Doğu ile birlikte diğer tüketici pazarlarını hedeflemektedir.</p>
                                <p>Marka Ekim 2021'de kurulmuştur ve o zamandan beri
                                    "herkes modanın güzelliğinin keyfini çıkarabilir" felsefesini sürdürmektedir. İşletmesi dünya çapında 220'den fazla ülke ve bölgeyi kapsamaktadır</p>
                                <p>Marka Ekim 2021'de kurulmuştur ve o zamandan beri
                                    "herkes <strong>Malikane Electronics</strong> ile modanın güzelliğinin keyfini çıkarabilir" felsefesini sürdürmektedir. İşletmesi dünya çapında 220'den fazla ülke ve bölgeyi kapsamaktadır</p>
                                <p>Marka Ekim 2021'de kurulmuştur ve o zamandan beri
                                    "herkes <strong>Malikane Electronics</strong> ile modanın güzelliğinin keyfini çıkarabilir" felsefesini sürdürmektedir. İşletmesi dünya çapında 220'den fazla ülke ve bölgeyi kapsamaktadır</p>
                                <p>Marka Ekim 2021'de kurulmuştur ve o zamandan beri bu felsefeyi sürdürmektedir.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default AboutTop
