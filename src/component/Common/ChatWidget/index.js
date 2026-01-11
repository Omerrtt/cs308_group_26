import React, { useState } from 'react'
import './ChatWidget.css'

const ChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false)
    const phoneNumber = '905393973949'
    const message = 'Merhaba! Yardıma ihtiyacım var.'

    const handleWhatsAppClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    return (
        <div className="chat-widget">
            {isOpen && (
                <div className="chat-popup">
                    <div className="chat-popup-header">
                        <h4>Canlı Destek</h4>
                        <button onClick={() => setIsOpen(false)} className="close-chat">
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                    <div className="chat-popup-body">
                        <p>Merhaba! Size nasıl yardımcı olabiliriz?</p>
                        <button onClick={handleWhatsAppClick} className="whatsapp-chat-btn">
                            <i className="fab fa-whatsapp"></i>
                            WhatsApp ile Sohbet Başlat
                        </button>
                    </div>
                </div>
            )}
            
            <button 
                className="chat-widget-button" 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Chat"
            >
                <i className={isOpen ? "fa fa-times" : "fa fa-comments"}></i>
            </button>
        </div>
    )
}

export default ChatWidget