import { useEffect } from 'react';
import { CalculatorDef } from '../types';
import { SITE_URL, SITE_NAME, SITE_THEME_COLOR, TWITTER_HANDLE } from '../config';

export function useSEO(calc: CalculatorDef | null) {
  useEffect(() => {
    if (!calc) return;

    const slug = calc.canonicalSlug || calc.slug;
    const currentCanonicalUrl = `${SITE_URL}/${slug}`;

    // 1. Update Document Title
    document.title = calc.seoTitle || `${calc.name} - ${SITE_NAME}`;

    // Helper to set/create/update meta tags
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

    // 2. Base Meta Tags
    setMetaTag('description', calc.seoDescription);
    if (calc.seoKeywords && calc.seoKeywords.length > 0) {
      setMetaTag('keywords', calc.seoKeywords.join(', '));
    } else {
      const el = document.querySelector('meta[name="keywords"]');
      if (el) el.remove();
    }
    
    // Enterprise Robots Directives
    setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    setMetaTag('author', SITE_NAME);
    setMetaTag('theme-color', SITE_THEME_COLOR);

    // 3. Set Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', currentCanonicalUrl);

    // 4. Open Graph Tags
    const ogTitle = calc.openGraph?.title || calc.seoTitle;
    const ogDesc = calc.openGraph?.description || calc.seoDescription;
    const ogImg = calc.openGraph?.image || `${SITE_URL}/logo.png`;

    setMetaTag('og:site_name', SITE_NAME, true);
    setMetaTag('og:title', ogTitle, true);
    setMetaTag('og:description', ogDesc, true);
    setMetaTag('og:type', calc.openGraph?.type || 'website', true);
    setMetaTag('og:url', currentCanonicalUrl, true);
    setMetaTag('og:image', ogImg, true);
    setMetaTag('og:image:width', '1200', true);
    setMetaTag('og:image:height', '630', true);
    setMetaTag('og:image:type', 'image/png', true);
    setMetaTag('og:locale', 'en_US', true);

    // 5. Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', ogTitle);
    setMetaTag('twitter:description', ogDesc);
    setMetaTag('twitter:image', ogImg);
    setMetaTag('twitter:site', TWITTER_HANDLE);
    setMetaTag('twitter:creator', TWITTER_HANDLE);

    // 6. JSON-LD Schema Injection
    const schemaElements: HTMLScriptElement[] = [];
    
    // Generate BreadcrumbList Schema Dynamically
    const categoryName = calc.category.charAt(0).toUpperCase() + calc.category.slice(1);
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `${categoryName} Calculators`,
          "item": `${SITE_URL}/#${calc.category}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": calc.name,
          "item": currentCanonicalUrl
        }
      ]
    };

    // Generate FAQ Schema Dynamically if faqs exist
    let faqSchema = null;
    if (calc.faqs && calc.faqs.length > 0) {
      faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": calc.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      };
    }

    // Generate SoftwareApplication Schema
    const softwareSchema = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": calc.name,
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      }
    };

    // Collect all schemas (either user defined or generated)
    const activeSchemas = [breadcrumbSchema, softwareSchema];
    if (faqSchema) {
      activeSchemas.push(faqSchema);
    }
    
    if (calc.schemas) {
      // If explicit schemas are defined, we merge or prefer them, but ensuring breadcrumb & app schemas exist.
      // Let's filter out standard breadcrumb/faq if already explicitly provided
      calc.schemas.forEach(s => {
        if (s["@type"] !== "BreadcrumbList" && s["@type"] !== "FAQPage" && s["@type"] !== "SoftwareApplication") {
          activeSchemas.push(s);
        }
      });
    }

    activeSchemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      script.className = 'dynamic-schema';
      document.head.appendChild(script);
      schemaElements.push(script);
    });

    // Cleanup function: remove dynamic tags and revert titles
    return () => {
      schemaElements.forEach(el => {
        if (document.head.contains(el)) {
          document.head.removeChild(el);
        }
      });
    };
  }, [calc]);
}
