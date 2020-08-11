/* dynamically build a page based on its URL */

"use strict";

(function() {
    let CORE = {
        CLASS: {
            LONG: "long",
            PROJECT: "project",
            SHORT: "short",
            TITLE: "title",
            VERSION: "version"
        },
        LINK: {
            PROJECTS: "/share/projects.json"
        }
    };
    /* create a child node */
    let child_node = function(init, _parent, tag) {
        let child = document.createElement(tag);

        if (typeof init === "function") {
            init(child);
        }
        _parent.appendChild(child);
        return child;
    };
    let core = {
        index: {
            /* build an index page */
            build: function() {
                /* title */

                need_title();

                /* content */

                need_body();
                let that = this;
                fetch({url: CORE.LINK.PROJECTS}).then(function(response) {
                    if (!response.ok) {
                        throw new Error("failed to pull index");
                    }

                    /* generate the index */

                    child_node(function(container) {
                        JSON.parse(response.body).forEach(function(project) {
                            let div = child_node(function(div) {
                                div.class = CORE.CLASS.PROJECT;
                            }, container, "div");
                            that._build_entry(div, project);
                        });
                    }, document.body, "div");
                });
            },

            /* build an index entry */
            _build_entry: async function(container, project) {
                /* title/link */

                child_node(function(a) {
                    a.class = CORE.CLASS.TITLE;
                    a.src = '/' + project["title"] + ".html";
                    a.text = project["title"];
                }, child_node(null, container, "div"), 'a');

                /* version */

                child_node(function(p) {
                    p.class = CORE.CLASS.VERSION;
                    p.text = project["version"];
                }, child_node(null, container, "div"), 'p');

                /* short description */

                child_node(function(i) {
                    i.class = CORE.CLASS.SHORT;
                    i.text = project["short"];
                }, child_node(null, container, "div"), 'i');
            }
        },

        init: function() {
            /* build */

            if (this._is_index()) {
                this.index.build();
            } else {
                this.project.build();
            }
        },

        /* return whether the page indicates the index */
        _is_index: function() {
            return '/'.includes(document.location.pathname)
                || document.location.pathname.includes("index");
        },

        project: {
            /* build a project page */
            build: function() {
                /* title */

                let title = this._project_title();
                need_title(title);

                /* content */

                need_body();
                let container = child_node(null, document.body, "div");

                /* index version */

                core.index._build_entry(title, container);

                /* remainder */

                ///////////////////////////////////////////////////////////////////////child_node(function(div) {});
            },

            /* return the presumed project title */
            _project_title: function() {
                let path = document.location.pathname;

                if (path.includes('/')) {
                    path = path.split('/').pop();
                }

                if (path.includes('.')) {
                    path = path.split('.');
                    path.pop();
                    return path.join('.');
                }
                return path;
            }
        }
    };
    /* create a body element if it doesn't already exist */
    let need_body = function() {
        if (!(document.body instanceof Element)) {
            document.body = child_node(null, document.documentElement,
                "body");
        }
    };
    let need_head = function() {
        if (!(document.head instanceof Element)) {
            document.head = child_node(null, document.documentElement, "head");
        }
    };
    /* create/update the title */
    let need_title = function(text) {
        let title = document.getElementsByTagName("title")[0];

        if (typeof title === "undefined") {
            need_head();
            title = child_node(null, document.head, "title");
        }
        title.text = text;
    };

    /* build */

    core.init();
})();

