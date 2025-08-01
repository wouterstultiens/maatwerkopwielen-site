# Revised Homepage Wireframes

Below is a high-level wireframe diagram for the homepage, illustrating stronger CTAs and clearer navigation.

```mermaid
flowchart TD
  A[Navbar | Logo / Plan intake] --> B[Hero | Headline + Plan uw gratis intakegesprek (Primary CTA)  Bekijk onze diensten (Secondary CTA)]
  B --> C[USP | Grid points + Plan uw intakegesprek (CTA)]
  C --> D[About | Jasper’s story – trust building]
  D --> E[Process | Steps + Vraag uw inspectierapport aan (CTA)]
  E --> F[Services | Service cards + Bekijk details / Plan intake (CTAs)]
  F --> G[IntakeCTA | Plan uw gratis intakegesprek (CTA with modal scheduling)]
  G --> H[Testimonials | Quotes + Bekijk onze cases (CTA)]
  H --> I[FAQ | Questions + Heeft u nog vragen? Plan intake (CTA)]
  I --> J[Contact | Bel +31 6 2796 65314  Mail ons (CTAs + Schedule link)]
  J --> K[Footer]
```

Notes:
- Navbar adds a persistent “Plan intake” button for quick access.
- Hero uses benefit-driven CTA copy from analysis/cta-copy.md.
- Each section includes contextually relevant CTA.
- IntakeCTA triggers a scheduling modal in addition to tel link.
- All CTAs use consistent brand styling and ARIA attributes for accessibility.