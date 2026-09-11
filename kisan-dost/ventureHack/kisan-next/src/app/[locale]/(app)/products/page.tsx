"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { products, Product } from "@/data/products";
import { useTranslations } from "next-intl";

/* ─── safe translation helper ─────────────────────────── */
function safeT(tProducts: any, key: string, fallback: string | undefined): string {
  try {
    if (tProducts.has(key)) {
      return tProducts(key);
    }
    return fallback ?? '';
  } catch {
    return fallback ?? '';
  }
}

/* ─── hooks ─────────────────────────────────────────── */
function useWindowWidth(): number {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

/* ─── ProductCard ────────────────────────────────────── */
const ProductCard: React.FC<{ product: Product; index: number; tProducts: any; tPage: any; isMobile: boolean }> = ({ product, index, tProducts, tPage, isMobile }) => {
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <Link href={`/products/${product.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          className="product-card-anim"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: "#fff",
            borderRadius: "20px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxShadow: hovered
              ? "0 20px 60px rgba(46,125,50,0.18), 0 4px 20px rgba(0,0,0,0.08)"
              : "0 4px 24px rgba(0,0,0,0.07)",
            transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            transform: hovered ? "translateY(-10px) scale(1.02)" : "translateY(0) scale(1)",
            cursor: "pointer",
            animationDelay: `${index * 0.15}s`,
          }}
        >
          {/* Image area */}
          <div
            style={{
              background: hovered
                ? "linear-gradient(135deg,#e8f5e9,#c8e6c9)"
                : "linear-gradient(135deg,#f1f8f1,#e8f5e9)",
              padding: "20px 16px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              position: "relative",
              overflow: "hidden",
              transition: "background 0.35s ease",
            }}
          >
            <div style={{
              position: "absolute", width: "180px", height: "180px", borderRadius: "50%",
              background: "rgba(255,255,255,0.5)", top: "-40px", right: "-40px",
              transform: hovered ? "scale(1.15)" : "scale(1)", transition: "transform 0.4s ease",
            }} />
            <div style={{
              width: "100%", height: "160px",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1,
              transform: hovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.35s ease",
            }}>
              <img
                src={product.imageUrl}
                alt={product.translationKey ? safeT(tProducts, `${product.translationKey}.name`, product.name) : (product.name ?? '')}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))",
                  cursor: "zoom-in"
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsFullscreen(true);
                }}
              />
            </div>
            <span style={{
              background: product.color, color: "#fff", padding: "4px 14px",
              borderRadius: "20px", fontSize: "13px", fontFamily: "'Raleway', sans-serif",
              fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 1,
            }}>
              {product.translationKey ? safeT(tProducts, `${product.translationKey}.tag`, product.tag) : product.tag}
            </span>
          </div>

          {/* Content */}
          <div style={{ padding: "14px 16px 18px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: "#1b3a1f" }}>
              {product.translationKey ? safeT(tProducts, `${product.translationKey}.name`, product.name) : product.name}
            </h3>
            <p style={{ margin: 0, fontSize: "14px", fontFamily: "'Raleway', sans-serif", color: "#6b7c6e", lineHeight: 1.5, fontWeight: 500 }}>
              {product.translationKey ? safeT(tProducts, `${product.translationKey}.description`, product.description) : product.description}
            </p>

            {/* ── Solves strip ── */}
            <div style={{
              background: `${product.color}08`,
              border: `1px solid ${product.color}20`,
              borderRadius: "12px", padding: "8px 12px",
              marginTop: "2px",
            }}>
              <span style={{
                fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: product.color,
                fontFamily: "'Raleway', sans-serif",
              }}>
                {tPage('solvesLabel')}:{" "}
              </span>
              <span style={{
                fontSize: "13px", color: "#2d3b2e", fontWeight: 600,
                fontFamily: "'Raleway', sans-serif",
              }}>
                {product.translationKey ? safeT(tProducts, `${product.translationKey}.tag`, product.tag) : product.tag}
              </span>
            </div>

            <button style={{
              marginTop: "6px",
              background: hovered ? "linear-gradient(135deg,#2e7d32,#388e3c)" : "linear-gradient(135deg,#1b5e20,#2e7d32)",
              color: "#fff", border: "none", borderRadius: "50px", padding: "12px 24px",
              fontSize: "14px", fontFamily: "'Raleway', sans-serif", fontWeight: 700,
              letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
              transition: "all 0.25s ease",
              boxShadow: hovered ? "0 8px 20px rgba(46,125,50,0.4)" : "0 4px 12px rgba(27,94,32,0.25)",
            }}>
              {tPage('viewProduct')}
            </button>
          </div>
        </div>
      </Link>


      {/* Fullscreen Image Modal */}
      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(232, 245, 233, 0.95)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            cursor: 'zoom-out'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsFullscreen(false);
          }}
        >
          <img
            src={product.imageUrl}
            alt={product.translationKey ? safeT(tProducts, `${product.translationKey}.name`, product.name) : (product.name ?? '')}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              animation: 'fadeUp 0.3s ease-out'
            }}
          />
          <button
            style={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              color: '#1b3a1f',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsFullscreen(false);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

/* ─── Main Page ──────────────────────────────────────── */
const RupiyaProductsPage: React.FC = () => {
  const tProducts = useTranslations("Products");
  const tPage = useTranslations("ProductsPage");
  const width = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const gridCols = isMobile ? "1fr" : isTablet ? "repeat(2,1fr)" : "repeat(3,1fr)";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .product-card-anim { animation: fadeUp 0.6s ease both; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── KisanDost-style pill nav links ── */
        .nav-pill {
          display: flex; align-items: center; gap: 7px;
          text-decoration: none; white-space: nowrap;
          font-family: 'Raleway', sans-serif; font-weight: 600; font-size: 17px;
          color: #2d5a27;
          padding: 8px 16px; border-radius: 50px;
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .nav-pill:hover { background: #dcedc8; color: #1b5e20; }
        .nav-pill.active { background: #e8f5e9; color: #1b5e20; font-weight: 700; }
        .nav-pill-icon { font-size: 19px; line-height: 1; }

        /* ── Mobile ── */
        .mobile-nav-pill {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none;
          font-family: 'Raleway', sans-serif; font-weight: 600; font-size: 18px;
          color: #2d5a27; padding: 15px 24px;
          border-bottom: 1px solid #e8f5e8;
          transition: background 0.15s;
        }
        .mobile-nav-pill:hover { background: #f1f8f0; color: #1b5e20; }

        .hamburger {
          display: flex; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 8px; border: none; background: transparent;
        }
        .hamburger span {
          display: block; width: 24px; height: 2px; background: #2d5a27;
          border-radius: 2px; transition: all 0.3s ease;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .login-btn {
          background: #2d5a27;
          color: #fff; border: none; border-radius: 50px;
          font-family: 'Raleway', sans-serif; font-weight: 700; font-size: 16px;
          letter-spacing: 0.03em; cursor: pointer;
          transition: all 0.2s ease;
        }
        .login-btn:hover { background: #1b5e20; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(45,90,39,0.35); }

        .lang-select {
          appearance: none; border: none; background: transparent;
          font-family: 'Raleway', sans-serif; font-weight: 600; font-size: 16px;
          color: #2d5a27; cursor: pointer; padding: 6px 4px;
        }
        .lang-select:focus { outline: none; }
        .lang-wrapper {
          display: flex; align-items: center; gap: 4px;
          border: 1.5px solid #c5ddb8; border-radius: 8px;
          padding: 0 10px; height: 36px; background: #fff;
          transition: border-color 0.2s;
        }
        .lang-wrapper:focus-within { border-color: #2d5a27; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f4f7f4", fontFamily: "'Raleway', sans-serif" }}>

        {/* ── Hero ── */}
        <div style={{
          textAlign: "center",
          padding: isMobile ? "48px 20px 36px" : isTablet ? "60px 32px 48px" : "72px 24px 56px",
          background: "linear-gradient(180deg,#e8f5e9 0%,#f4f7f4 100%)",
        }}>
          <div style={{
            display: "inline-block", background: "#c8e6c9", color: "#2e7d32",
            borderRadius: "50px", padding: "6px 20px",
            fontSize: isMobile ? "13px" : "14px",
            fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px",
          }}>
            {tPage('heroTag')}
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 800,
            fontSize: isMobile ? "32px" : isTablet ? "46px" : "62px",
            color: "#1b3a1f", margin: "0 0 14px",
            letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            {tPage('heroTitle')}
          </h1>

          <div style={{ width: "64px", height: "4px", background: "linear-gradient(90deg,#2e7d32,#66bb6a)", borderRadius: "4px", margin: "18px auto 16px" }} />

          <p style={{
            color: "#5a7a5d",
            fontSize: isMobile ? "16px" : "18px",
            fontWeight: 500, maxWidth: "520px", margin: "0 auto",
            lineHeight: 1.6, padding: "0 12px",
          }}>
            {tPage('heroSubtitle')}
          </p>
        </div>

        {/* ── Products Grid ── */}
        <div style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: isMobile ? "20px 16px 56px" : isTablet ? "28px 28px 64px" : "28px 32px 80px",
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: isMobile ? "20px" : "28px",
          alignItems: "stretch",
        }}>
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} tProducts={tProducts} tPage={tPage} isMobile={isMobile} />
          ))}
        </div>

        {/* ── Footer ── */}
        <div style={{
          background: "#1b3a1f", textAlign: "center",
          padding: isMobile ? "18px 20px" : "22px",
          color: "#81c784",
          fontSize: isMobile ? "14px" : "15px",
          fontFamily: "'Raleway', sans-serif", fontWeight: 600, letterSpacing: "0.04em",
        }}>
          {tPage('footer')}
        </div>
      </div>
    </>
  );
};

export default RupiyaProductsPage;
