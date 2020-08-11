/*
dynamically build a page based on its URL

for URLs that either contain "index" or are empty, this builds a brief index of
entries within `CORE.LINK.PROJECTS`

for all other URLs, this attempts to build an extended project-specific page
for a project whose title is the URL's path's basename (e.g. "/project.html" ->
"project")
*/

"use strict";

(function() {
    let CORE = {
        CLASS: {
            DESCRIPTION: "description",
            PROJECT: "project",
            TITLE: "title",
            VERSION: "version"
        },
        LINK: {
            PROJECTS: "/share/data/projects.json"
        },
        PROJECT: {
            DESCRIPTION: "description",
            TITLE: "title",
            VERSION: "version"
        }
    };
    /* create a child node */
    let child_node = function(init, parent, tag) {
        let child = document.createElement(tag);

        if (typeof init === "function") {
            init(child);
        }
        parent.appendChild(child);
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
                fetch(CORE.LINK.PROJECTS).then(function(response) {
                    if (!response.ok) {
                        throw new Error("failed to pull index");
                    }

                    /* generate the index */

                    child_node(async function(container) {
                        await response.json().then(function(projects) {
                            projects.forEach(function(project) {
                                let div = child_node(function(div) {
                                    div.class = CORE.CLASS.PROJECT;
                                }, container, "div");
                                that._build_entry(div, project);
                            });
                        });
                    }, document.body, "div");
                });
            },

            /* build an index entry */
            _build_entry: async function(container, project) {
                /* title/link */

                child_node(function(a) {
                    a.class = CORE.CLASS.TITLE;
                    a.href = '/' + project[CORE.PROJECT.TITLE] + ".html";
                    a.text = project[CORE.PROJECT.TITLE];
                }, child_node(null, container, "div"), 'a');

                /* version */

                child_node(function(p) {
                    p.class = CORE.CLASS.VERSION;
                    p.text = project[CORE.PROJECT.VERSION];
                }, child_node(null, container, "div"), 'p');

                /* short description */

                child_node(function(i) {
                    i.class = CORE.CLASS.DESCRIPTION;
                    i.innerText = project[CORE.PROJECT.DESCRIPTION];
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
                console.log(title);
                need_title(title);

                /* content */

                need_body();
                let container = child_node(null, document.body, "div");

                /* index version */

                core.index._build_entry(container, title);

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

