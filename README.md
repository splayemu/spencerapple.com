## Usage
Build artifacts
> npm run build

Build artifacts and start preview server
> npm run preview

Update prerenderGraphComponents
> npm run update-local-modules

## Deployment & Hosting
spencerapple.com is a static website and is hosted with [Netlify](https://www.netlify.com/). Pushing to master causes Netlify to build and deploy the side. Netlify also hosts the content on it's CDN.

Cloudflare proxies the DNS records through Netlify (or perhaps it's the other way around).

## Notes
* site metadata is passed to the layouts 
```javascript
Metalsmith {
  _metadata:
   { site: 
      { title: 'title',
        url: url,
        description: 'Fun times for all',
        repo: 'https://gitlab.com/username/title' },
     partials: [ [Object], metadata: undefined ],
     content: [ [Object], metadata: undefined ],
     collections: { content: [Object], partials: [Object] } },
```
