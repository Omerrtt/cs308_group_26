import React, { useState } from 'react'
import { useHistory } from "react-router-dom"
import Swal from 'sweetalert2';

const TopHeader = () => {
    const history = useHistory()
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchTerm.trim();
        if (!trimmed) {
            Swal.fire({
                icon: 'info',
                title: 'Arama',
                text: 'Lütfen aramak istediğiniz ürünü yazın.'
            })
            return;
        }
        history.push(`/shop?search=${encodeURIComponent(trimmed)}`);
    }

    return (
        <>
            <section id="top_header">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="top_header_left">
                                <form 
                                    className="top-search-form" 
                                    onSubmit={handleSearchSubmit}
                                    style={{display: 'flex', gap: '10px', alignItems: 'center'}}
                                >
                                    <input
                                        type="text"
                                        placeholder="Ürün ara..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="top-search-input"
                                        style={{
                                            flex: 1,
                                            borderRadius: '20px',
                                            border: '1px solid #ddd',
                                            padding: '8px 16px'
                                        }}
                                    />
                                    <button 
                                        type="submit" 
                                        className="top-search-button"
                                        style={{
                                            borderRadius: '20px',
                                            padding: '8px 16px',
                                            border: 'none',
                                            backgroundColor: '#ff8a00',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i className="fa fa-search"></i>
                                        Ara
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export default TopHeader