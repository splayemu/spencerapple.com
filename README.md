## Usage
Build artifacts
> node build.js

Build artifacts and start preview server
> node build.js --preview

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
