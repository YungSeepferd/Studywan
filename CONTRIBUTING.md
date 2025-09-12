# Contributing to StudyWan

We're excited that you're interested in contributing to StudyWan! This document provides guidelines and information about contributing to this project.

## Types of Contributions

We welcome various types of contributions:

- Content creation (TOCFL materials, Taiwanese dialect content)
- Technical development
- Documentation improvements
- Translation work (German-Chinese-English)
- Bug reports and fixes
- Feature suggestions and implementations

## Content Guidelines

### Language Content

- Traditional Chinese characters must be used (not simplified)
- Include Zhuyin (注音) for pronunciation
- German translations and explanations should be clear and accurate
- Taiwanese dialect content should be clearly marked and referenced

### Technical Contributions

Once the technical architecture is finalized, this section will include:

- Code style guidelines
- Testing requirements
- Pull request process
- Development setup instructions

## Getting Started

1. Fork the repository
2. Create a new branch for your work
3. Make your changes
4. Submit a pull request

## Development Environment
### Web app (Vite + React)
```
cd apps/web
npm install
npm run dev
```

### Build & preview
```
npm run build
npm run preview
```

### Typecheck, lint, format
```
npm run typecheck
npm run lint
npm run format
```

### Data workflows
- Generate A/B decks from official XLSX: `make xlsx-all`
- Topic/packs/A1 program splits: `make split-a1-topics`, `make pack-a1`, `make a1-program`
- Dictionary enrichment (optional): `make merge-a1-cedict` or `make merge-a1-cedict-moe`
- Publish stories to web: `make web-copy-stories`
- Copy deck manifest to web: `make web-copy-decks`

### Data validation
```
cd apps/web
npm run validate:data
```

Note: A data validator will be added under `npm run validate:data` (see Task 2 in NextSteps).

## Communication

- Create issues for bugs or feature suggestions
- Use clear and descriptive titles
- Include as much relevant information as possible

## Review Process

1. Submit your pull request
2. Maintainers will review your contribution
3. Address any requested changes
4. Once approved, your contribution will be merged

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a positive community atmosphere

## Questions?

If you have questions, please open an issue for discussion.

Thank you for contributing to StudyWan!
