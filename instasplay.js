(function() {

    /**
     * TODO:
     * Config:
     * - carousel: TOP_ONLY, SPLAY_SHIFT, SPLAY_, (ROTATE), (SCROLLABLE)
     * - insert-point: node or query selector, or none to not auto-insert
     * - img-class
     */

    const URL_BASE = "https://graph.instagram.com/me/media";
    const FIELD_QUERY = "fields=" + [
        "id",
        "username",
        "caption",
        "timestamp",
        "media_type",
        "media_url",
        "permalink",
        "thumbnail_url",
        "children.media_type",
        "children.media_url",
        "children.thumbnail_url",
        "children.permalink"
    ].join(",");

    const DEFAULT_TARGET = "#instasplay-root";
    const DEFAULT_MORE_BUTTON = ".instasplay-more";

    function createMedia(media_data) {
        return {
            'IMAGE': () => {
                if (!media_data.media_url) {
                    // Sometimes the API and is missing this.
                    console.warn("API missing media_url for " + media_data.id);
                    return undefined;
                }
                const imgTag = document.createElement('img');
                imgTag.src = media_data.media_url;
                imgTag.className = 'instasplay-media';
                return imgTag;
            },
            'CAROUSEL_ALBUM': () => {
                const fragment = document.createDocumentFragment();
                media_data.children
                    .data
                    .map(createMedia)
                    .forEach(child => child && fragment.appendChild(child));
                return fragment;
            },
            'VIDEO': () => {
                if (!media_data.media_url) {
                    // Sometimes the API and is missing this.
                    console.warn("API missing media_url for " + media_data.id);
                    return undefined;
                }
                const wrapper = document.createElement('div');
                const video = document.createElement('video');

                const thumbnailImg = document.createElement('img');
                thumbnailImg.src = media_data.thumbnail_url;
                thumbnailImg.className = 'instasplay-media';
                return thumbnailImg;
            }
        }[media_data.media_type]();
    }

    function request(url, callback) {
        const httpRequest = new XMLHttpRequest();

        httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    callback(JSON.parse(httpRequest.responseText));
                }
            }
        };

        httpRequest.open('GET', url, true);
        httpRequest.send();
    }

    function transform(data) {
        const output = [];

        for (const media_data of data) {
            const media = createMedia(media_data);
            !!media && output.push(media);
        }
        return output;
    }

    function insert(nodes, target) {
        let container = target;
        if (typeof target === 'string') {
            container = document.querySelector(target);
        }

        nodes.forEach(node => container.appendChild(node));
    }

    function processData(json) {
        const target = DEFAULT_TARGET;
        const elements = transform(json.data);

        insert(elements, target);
    }

    function prepareForMore(selector, instasplay) {
        document.querySelectorAll(selector).forEach(trigger => {
           if (instasplay.hasMore()) {
               trigger.onclick = () => instasplay.more();
           } else {
               trigger.disabled = "disabled";
           }
        });
    }

    class Instasplay {
        constructor(token) {
            this.token = token;
            this.nextUrl = undefined;
        }

        load() {
            request(URL_BASE + "?" + FIELD_QUERY + "&access_token=" + this.token, (json) => {
                this.nextUrl = json.paging.next;
                processData(json);
                prepareForMore(DEFAULT_MORE_BUTTON, this);
            });
        }

        more() {
            if (!this.nextUrl) {
                return;
            }

            request(this.nextUrl, (json) => {
                this.nextUrl = json.paging.next;
                processData(json);
                prepareForMore(DEFAULT_MORE_BUTTON, this);
            });
        }

        hasMore() {
            return !!this.nextUrl;
        }

    }

    window.Instasplay = Instasplay;
})();


