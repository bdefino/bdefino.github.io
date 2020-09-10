/*
dynamically build a page based on its URL

for URLs that either contain "index" or are empty, this builds a brief index of
entries within `CORE.LINK.PROJECTS`

for all other URLs, this attempts to build an extended project-specific page
for a project whose title is the URL's path's basename (e.g. "/project.html" ->
"project")

to actually see the generated HTML, build the page, then run
`console.log(document.documentElement.innerHTML)`
*/

"use strict";

(function() {
    let CLASS = {
        DESCRIPTION: "description",
        DOCUMENTATION: "documentation",
        INDEX: "index",
        INDEX_ENTRY: "index-entry",
        PROJECT: "project",
        REPOSITORY: "repository",
        TITLE: "title"
    };
    let ID = {
        PROJECT_PREFIX: "project-"
    };
    let PAGE = {
        PROJECT_PREFIX: "/index.html?title=",
        TYPE: {
            INDEX: "index",
            PROJECT: "project"
        }
    };
    let QUERY = {
        TITLE: "title"
    };
    let SHARE = {
        DOCS_DIR: "/share/data/docs",
        PROJECTS_JSON: "/share/data/projects.json",
        REPOSITORY_PNG: "/share/images/repository.png",
    };
    /* build the page based on its perceived type */
    let build = function() {
        switch (infer_page_type()) {
        case PAGE.TYPE.INDEX:
            build_index_page();
            break;
        case PAGE.TYPE.PROJECT:
            build_project_page();
            break;
        default:
            throw new Error();
        }
    };
    /* build an index entry for a project with a given title */
    let build_index_entry = function(container, project) {
        let entry = child_node(function(a) {
            a.classList.add(CLASS.INDEX_ENTRY);
            a.href = project_link(project.title);
            a.id = ID.PROJECT_PREFIX + project.title;
        }, container, 'a');

        /* title */

        child_node(function(span) {
            span.appendChild(document.createTextNode(project.title));
            span.classList.add(CLASS.TITLE);
        }, entry, "span");

        /* repository */

        child_node(function(a) {
            a.classList.add(CLASS.REPOSITORY);
            a.href = project.repository;
            child_node(i => i.src = SHARE.REPOSITORY_PNG, a, "img");
        }, entry, 'a');

        /* description */

        child_node(function(span) {
            span.classList.add(CLASS.DESCRIPTION);
            span.innerText = project.description;
        }, entry, "span");
    };
    /* build an index page */
    let build_index_page = async function() {
        set_title(CLASS.INDEX);
        let container = child_node(d => d.classList.add(CLASS.INDEX),
            need("body"), "div");
        (await list_projects()).sort(function(a, b) {
            if (a.title < b.title) {
                return -1;
            } else if (a.title > b.title) {
                return 1;
            }
            return 0;
        }).forEach(p => build_index_entry(container, p));
    };
    /* build a project page */
    let build_project_page = async function() {
        let project = (await select_projects(infer_project_title()))[0];
        set_title(project.title);
        let container = child_node(d => d.classList.add(CLASS.PROJECT),
            need("body"), "div");

        /* build an index entry */

        build_index_entry(container, project);

        /* build the documentation */

        child_node(async function(div) {
            div.classList.add(CLASS.DOCUMENTATION);
            div.innerHTML = await project_documentation(project.title);
        }, container, "div");
    };
    /* create/initialize/attach a new child node */
    let child_node = function(init, parent, tag) {
        let child = document.createElement(tag);

        if (typeof init === "function") {
            init(child);
        }
        parent.appendChild(child);
        return child;
    };
    /* infer the page type based on the URL */
    let infer_page_type = function() {
        if (typeof infer_project_title() === "string") {
            return PAGE.TYPE.PROJECT;
        }
        return PAGE.TYPE.INDEX;
    };
    /* infer the project title based on the URL */
    let infer_project_title = function() {
        return (new URL(document.location.href)).searchParams.get(
            QUERY.TITLE);
    };
    /* return an array of projects */
    let list_projects = async function() {
        return await (await response_for(SHARE.PROJECTS_JSON)).json();
    };
    /* create an element under the document (usually the body or head) */
    let need = function(which) {
        which = which.toLowerCase();

        if (!(document[which] instanceof Element)) {
            child_node(null, document.documentElement, which);
        }
        return document[which];
    };
    /* return the documentation for a project with a given title */
    let project_documentation = async function(title) {
        let text = await (await response_for(project_documentation_link(
            title))).text();
        return text;
    };
    /* return the documentation link for a project with a given title */
    let project_documentation_link = function(title) {
        return `${SHARE.DOCS_DIR}/${title}.html`;
    };
    /* return the link for a project with a given title */
    let project_link = function(title) {
        return PAGE.PROJECT_PREFIX + title;
    };
    /* return the response if `fetch` succeeds, otherwise `undefined` */
    let response_for = async function() {
        return await fetch(...arguments).then(function(response) {
            return response.ok ? response : undefined;
        });
    };
    /* select projects with a given title */
    let select_projects = async function(title, projects = undefined) {
        if (!Array.isArray(projects)) {
            projects = await list_projects();
        }
        return projects.filter(p => p.title === title);
    };
    /* set the title */
    let set_title = function(title) {
        let title_element = document.getElementsByTagName("title")[0];

        if (typeof title_element === "undefined") {
            need("head");
            title_element = child_node(null, document.head, "title");
        }
        title_element.text = title;
    };

    /* build */

    build();
})();

