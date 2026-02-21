const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "@id": "https://helloiagency.com/#organization",
            "name": "iAgency",
            "url": "https://helloiagency.com/",
            "email": "contacto@helloiagency.com",
            "sameAs": [
                "https://www.facebook.com/helloiagency",
                "https://www.instagram.com/hello_iagency/"
            ],
            "areaServed": [
                {
                    "@type": "Country",
                    "name": "Argentina"
                },
                {
                    "@type": "AdministrativeArea",
                    "name": "Latinoamérica"
                }
            ],
            "contactPoint": [
                {
                    "@type": "ContactPoint",
                    "contactType": "sales",
                    "email": "contacto@helloiagency.com",
                    "availableLanguage": ["es"]
                }
            ]
        },
        {
            "@type": "WebSite",
            "@id": "https://helloiagency.com/#website",
            "url": "https://helloiagency.com/",
            "name": "iAgency",
            "inLanguage": "es-AR",
            "publisher": {
                "@id": "https://helloiagency.com/#organization"
            }
        },
        {
            "@type": "Service",
            "@id": "https://helloiagency.com/#service",
            "name": "Automatización e Integraciones con IA para Negocios",
            "serviceType": "Automatización de procesos, asistentes conversacionales y flujos con integraciones",
            "provider": {
                "@id": "https://helloiagency.com/#organization"
            },
            "areaServed": [
                {
                    "@type": "Country",
                    "name": "Argentina"
                },
                {
                    "@type": "AdministrativeArea",
                    "name": "Latinoamérica"
                }
            ]
        },
        {
            "@type": "FAQPage",
            "@id": "https://helloiagency.com/#faq",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "¿Qué tipo de automatizaciones ofrecen?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Diseñamos asistentes con IA para WhatsApp e Instagram y automatizaciones a medida con integraciones a herramientas como Google Sheets o CRM."
                    }
                },
                {
                    "@type": "Question",
                    "name": "¿En cuánto tiempo se implementa una solución?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Las implementaciones estándar pueden estar listas en 24–72 horas según el flujo y complejidad del negocio."
                    }
                },
                {
                    "@type": "Question",
                    "name": "¿Trabajan solo en Argentina?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Trabajamos principalmente con negocios en Argentina y Latinoamérica."
                    }
                }
            ]
        }
    ]
};

const script = document.createElement('script');
script.type = 'application/ld+json';
script.text = JSON.stringify(schemaData);
document.head.appendChild(script);
