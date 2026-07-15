import { useEffect } from 'react';
import { CalculatorDef } from '../types';

export function useSEO(calc: CalculatorDef | null) {
  useEffect(() => {
    if (!calc) return;

    // 1. Update document Title
    document.title = calc.seoTitle || calc.name;

    // Helper to set or create meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
      return element;
    };

    // 2. Set Meta Description and Keywords
    setMetaTag('description', calc.seoDescription);
    if (calc.seoKeywords && calc.seoKeywords.length > 0) {
      setMetaTag('keywords', calc.seoKeywords.join(', '));
    } else {
      const el = document.querySelector('meta[name="keywords"]');
      if (el) el.remove();
    }

    // 3. Set Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    const slug = calc.canonicalSlug || calc.slug;
    linkCanonical.setAttribute('href', `https://financecalc-one.vercel.app/${slug}`);

    // 4. Open Graph Tags
    if (calc.openGraph) {
      setMetaTag('og:title', calc.openGraph.title, true);
      setMetaTag('og:description', calc.openGraph.description, true);
      setMetaTag('og:type', calc.openGraph.type || 'website', true);
      setMetaTag('og:url', `https://financecalc-one.vercel.app/${slug}`, true);
      if (calc.openGraph.image) {
        setMetaTag('og:image', calc.openGraph.image, true);
      }
    }

    // 5. Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', calc.openGraph?.title || calc.seoTitle);
    setMetaTag('twitter:description', calc.openGraph?.description || calc.seoDescription);

    // 6. JSON-LD Schemas
    const schemaElements: HTMLScriptElement[] = [];
    if (calc.schemas && calc.schemas.length > 0) {
      calc.schemas.forEach(schema => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(schema);
        script.className = 'dynamic-schema';
        document.head.appendChild(script);
        schemaElements.push(script);
      });
    }

    // Cleanup function
    return () => {
      schemaElements.forEach(el => {
        if (document.head.contains(el)) {
          document.head.removeChild(el);
        }
      });
    };
  }, [calc]);
}
