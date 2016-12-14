## Usage
Build artifacts
> npm run build

Build artifacts and start preview server
> npm run preview

Update prerenderGraphComponents
> npm run update-local-modules

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
