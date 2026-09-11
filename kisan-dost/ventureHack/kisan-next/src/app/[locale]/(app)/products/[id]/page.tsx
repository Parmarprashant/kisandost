"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { products } from "@/data/products";
import { useTranslations, useLocale } from "next-intl";

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

/* ─── Detail Content ─────────────────────────────────── */
function ProductDetailContent() {
  const params = useParams();
  const width = useWindowWidth();
  const isMobile = width < 768;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "features" | "usage">("overview");
  const tProducts = useTranslations("Products");
  const tPage = useTranslations("ProductsPage");
  const locale = useLocale();

  const productId = Number(params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f7f4", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Raleway', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "66px", marginBottom: "16px" }}>🔍</div>
          <h2 style={{ color: "#1b3a1f", fontFamily: "'Playfair Display', serif", fontSize: "32px", marginBottom: "12px" }}>{tPage('productNotFound')}</h2>
          <p style={{ color: "#6b7c6e", fontSize: "20px", marginBottom: "24px" }}>{tPage('notFoundDesc')}</p>
          <Link href="/products" style={{
            background: "linear-gradient(135deg,#1b5e20,#2e7d32)", color: "#fff",
            padding: "14px 30px", borderRadius: "50px", textDecoration: "none",
            fontWeight: 700, fontSize: "16px", letterSpacing: "0.06em"
          }}>
            {tPage('allProducts')}
          </Link>
        </div>
      </div>
    );
  }

  const name = product.translationKey ? safeT(tProducts, `${product.translationKey}.name`, product.name) : product.name;
  const description = product.translationKey ? safeT(tProducts, `${product.translationKey}.longDescription`, product.longDescription || product.description) : (product.longDescription || product.description);
  const tag = product.translationKey ? safeT(tProducts, `${product.translationKey}.tag`, product.tag) : product.tag;

  // Features translation logic
  const features = product.translationKey
    ? (() => {
        try {
          const list: any = tProducts.raw(`${product.translationKey}.features`);
          return Array.isArray(list) ? list : (product.features || []);
        } catch {
          return product.features || [];
        }
      })()
    : (product.features || []);

  // Usage translation logic
  const usageItems = product.translationKey
    ? (() => {
        try {
          const obj: any = tProducts.raw(`${product.translationKey}.usage`);
          if (obj && typeof obj === 'object') {
            return Object.entries(obj).map(([key, val]) => ({ key: key.replace(/_/g, ' '), value: val as string }));
          }
          return null;
        } catch {
          return null;
        }
      })()
    : null;

  const fallbackUsage = product.usage 
    ? Object.entries(product.usage).map(([key, value]) => ({ key: key.replace(/_/g, ' '), value }))
    : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .detail-fade { animation: fadeUp 0.5s ease both; }
        .detail-scale { animation: scaleIn 0.4s ease both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f4f7f4", fontFamily: "'Raleway', sans-serif" }}>

        {/* ── Breadcrumb ── */}
        <div style={{
          background: "linear-gradient(180deg,#e8f5e9 0%,#f4f7f4 100%)",
          padding: isMobile ? "20px 16px 0" : "28px 32px 0",
          maxWidth: "1100px", margin: "0 auto"
        }}>
          <Link href="/products" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            color: "#2e7d32", textDecoration: "none", fontWeight: 600,
            fontSize: "16px", padding: "10px 20px", borderRadius: "50px",
            background: "#e8f5e9", transition: "all 0.2s ease"
          }}>
            {tPage('allProducts')}
          </Link>
        </div>

        {/* ── Main Content ── */}
        <div className="detail-fade" style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: isMobile ? "20px 16px 40px" : "32px 32px 60px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "24px" : "48px",
          alignItems: "start"
        }}>

          {/* ── Left: Image ── */}
          <div className="detail-scale" style={{
            background: "#fff", borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)"
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${product.color}15, ${product.color}08)`,
              padding: isMobile ? "32px 24px" : "48px 40px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
              position: "relative"
            }}>
              <div style={{
                position: "absolute", width: "200px", height: "200px", borderRadius: "50%",
                background: `${product.color}10`, top: "-60px", right: "-60px"
              }} />
              <div style={{
                position: "absolute", width: "120px", height: "120px", borderRadius: "50%",
                background: `${product.color}08`, bottom: "-30px", left: "-30px"
              }} />
              <img
                src={product.imageUrl}
                alt={name}
                style={{
                  maxWidth: "100%", maxHeight: isMobile ? "240px" : "320px",
                  objectFit: "contain",
                  filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.15))",
                  cursor: "zoom-in", zIndex: 1,
                  transition: "transform 0.3s ease"
                }}
                onClick={() => setIsFullscreen(true)}
              />
              <span style={{
                background: product.color, color: "#fff", padding: "6px 18px",
                borderRadius: "20px", fontSize: "13px", fontWeight: 700,
                letterSpacing: "0.08em", textTransform: "uppercase", zIndex: 1
              }}>
                {tag}
              </span>
            </div>
          </div>

          {/* ── Right: Info ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Name */}
            <div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif", fontWeight: 800,
                fontSize: isMobile ? "28px" : "34px", color: "#1b3a1f",
                margin: "0", lineHeight: 1.2, letterSpacing: "-0.02em"
              }}>
                {name}
              </h1>
            </div>

            {/* Price */}
            <div style={{
              background: `linear-gradient(135deg, ${product.color}, ${product.color}cc)`,
              color: "#fff", padding: "14px 24px", borderRadius: "16px",
              display: "inline-flex", alignItems: "center", gap: "10px",
              alignSelf: "flex-start",
              boxShadow: `0 4px 16px ${product.color}40`
            }}>
              <span style={{ fontSize: "15px", fontWeight: 600, opacity: 0.9 }}>{tPage('priceLabel')}</span>
              <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.01em" }}>
                {product.price ? `₹${product.price}` : tPage('priceOnRequest')}
              </span>
            </div>

            {/* Tab Navigation */}
            <div style={{
              display: "flex", gap: "4px", background: "#e8f5e9",
              padding: "4px", borderRadius: "14px"
            }}>
              {(["overview", "features", "usage"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: "12px 18px", borderRadius: "10px", border: "none",
                    background: activeTab === tab ? "#fff" : "transparent",
                    color: activeTab === tab ? "#1b5e20" : "#6b7c6e",
                    fontWeight: activeTab === tab ? 700 : 600,
                    fontSize: "15px", cursor: "pointer",
                    boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s ease",
                    fontFamily: "'Raleway', sans-serif"
                  }}
                >
                  {tPage(`tabs.${tab}`)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{
              background: "#fff", borderRadius: "20px", padding: "24px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)", minHeight: "180px"
            }}>
              {activeTab === "overview" && (
                <div style={{ animation: "fadeUp 0.3s ease" }}>
                  <p style={{
                    color: "#2d3b2e", fontSize: "17px", lineHeight: 1.7,
                    fontWeight: 500, margin: 0
                  }}>
                    {description || tPage('noDescription')}
                  </p>
                </div>
              )}

              {activeTab === "features" && (
                <div style={{ animation: "fadeUp 0.3s ease" }}>
                  {features.length > 0 ? (
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {features.map((feature: string, i: number) => (
                        <li key={i} style={{
                          display: "flex", alignItems: "flex-start", gap: "12px",
                          padding: "10px 14px", borderRadius: "12px",
                          background: i % 2 === 0 ? "#f8fdf8" : "#fff",
                          fontSize: "16px", color: "#2d3b2e", fontWeight: 500, lineHeight: 1.5
                        }}>
                          <span style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: "24px", height: "24px", borderRadius: "50%",
                            background: product.color, color: "#fff",
                            fontSize: "14px", fontWeight: 800, flexShrink: 0, marginTop: "1px"
                          }}>
                            ✓
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: "#6b7c6e", fontSize: "16px", margin: 0 }}>{tPage('noFeatures')}</p>
                  )}
                </div>
              )}

              {activeTab === "usage" && (
                <div style={{ animation: "fadeUp 0.3s ease" }}>
                  {(usageItems || fallbackUsage).length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {(usageItems || fallbackUsage).map((item, i) => (
                        <div key={i} style={{
                          padding: "14px 16px", borderRadius: "14px",
                          border: `1px solid ${product.color}20`,
                          background: `${product.color}05`
                        }}>
                          <div style={{
                            fontWeight: 700, fontSize: "15px", color: product.color,
                            textTransform: "capitalize", marginBottom: "4px",
                            letterSpacing: "0.04em"
                          }}>
                            {item.key}
                          </div>
                          <div style={{ fontSize: "16px", color: "#2d3b2e", fontWeight: 500, lineHeight: 1.5 }}>
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: "#6b7c6e", fontSize: "16px", margin: 0 }}>{tPage('noUsage')}</p>
                  )}
                </div>
              )}
            </div>

            {/* WhatsApp CTA */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi, I am interested in buying *${name}* (${tag}). Please share pricing and availability details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  background: "linear-gradient(135deg,#25D366,#128C7E)",
                  color: "#fff", border: "none", borderRadius: "50px",
                  padding: "16px 38px", fontSize: "17px", fontWeight: 700,
                  letterSpacing: "0.06em", textTransform: "uppercase",
                  cursor: "pointer", fontFamily: "'Raleway', sans-serif",
                  boxShadow: "0 8px 24px rgba(37,211,102,0.35)",
                  transition: "all 0.25s ease", textDecoration: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 12px 32px rgba(37,211,102,0.5)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,211,102,0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {tPage('buyOnWhatsApp')}
              </a>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          background: "#1b3a1f", textAlign: "center",
          padding: isMobile ? "18px 20px" : "22px",
          color: "#81c784", fontSize: isMobile ? "14px" : "15px",
          fontFamily: "'Raleway', sans-serif", fontWeight: 600, letterSpacing: "0.04em"
        }}>
          {tPage('footer')}
        </div>
      </div>

      {/* ── Fullscreen Image Modal ── */}
      {isFullscreen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(232, 245, 233, 0.95)",
            backdropFilter: "blur(4px)", zIndex: 9999,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", cursor: "zoom-out"
          }}
          onClick={() => setIsFullscreen(false)}
        >
          <img
            src={product.imageUrl}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
          <button
            style={{
              position: "absolute", top: "24px", right: "24px",
              backgroundColor: "rgba(255,255,255,0.5)", color: "#1b3a1f",
              border: "none", borderRadius: "50%", width: "40px", height: "40px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "20px", fontWeight: 700
            }}
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

/* ─── Page Wrapper ── */
export default function ProductDetailPage() {
  const tPage = useTranslations("ProductsPage");
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#f4f7f4", fontFamily: "'Raleway', sans-serif"
      }}>
        <div style={{ textAlign: "center", color: "#2e7d32" }}>
          <div style={{ fontSize: "34px", marginBottom: "12px" }}>🌿</div>
          <p style={{ fontWeight: 600, fontSize: "18px" }}>{tPage('loading')}</p>
        </div>
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  );
}
