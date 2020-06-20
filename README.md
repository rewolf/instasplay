# Instasplay.js

Display an Instagram portfolio from any website. 

Currently, this is just used personally, but I hope to make it generally usable soon.

## Auto-configured Easy Setup

Instasplay comes out of the box with an opinionated configuration. The minimum configuration required, is your
Facebook access token.

```javascript
    new Instasplay(token).load();
```

This will automatically:
* Call the Instagram API to fetch all media for the given token
* Expect a container element with id `instasplay-root`.
* Create a grid-layout with all media within that container.
* If there are buttons with class `instasplay-more`, they will be auto-configured to load more pages of resources when clicked.
* If there is no such button, one will be added to the bottom of the container
* Carousal media will be auto-downloaded and splayed/expanded in-place beside eachother.