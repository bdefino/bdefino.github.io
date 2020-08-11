/*
dynamically build a page based on its URL

for URLs that either contain "index" or are empty, this builds a brief index of
entries within `CORE.LINK.PROJECTS`

for all other URLs, this attempts to build an extended project-specific page
for a project whose title is the URL's path's basename (e.g. "/project.html" ->
"project")

to actually see the generated HTML:
    `console.log(document.documentElement.innerHTML)` (after building)
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
        TITLE: "title",
        VERSION: "version"
    };
    let ID = {
        PROJECT_PREFIX: "project-"
    };
    let SHARE = {
        DOCS_DIR: "/share/data/docs",
        PROJECTS_JSON: "/share/data/projects.json",
        REPOSITORY_PNG: "/share/images/repository.png",
    };
    /* build the page based on its perceived type */
    let build = function() {
        switch (infer_page_type()) {
        case CLASS.INDEX:
            build_index_page();
            break;
        case CLASS.PROJECT:
            build_project_page();
            break;
        default:
            throw new Error();
        }
    };
    /* build an index entry for a project with a given title */
    let build_index_entry = function(container, project) {
        let entry = child_node(function(div) {
            div.classList.add(CLASS.INDEX_ENTRY);
            div.id = ID.PROJECT_PREFIX + project.title;
        }, container, "div");

        /* (local) link/title */

        child_node(function(a) {
            a.href = project_link(project.title);
            a.text = project.title;
        }, child_node(d => d.classList.add(CLASS.TITLE), entry, "div"), 'a');

        /* respository */

        child_node(function(a) {
            a.href = project.repository;
            child_node(i => i.src = SHARE.REPOSITORY_PNG, a, "img");
        }, child_node(d => d.classList.add(CLASS.REPOSITORY), entry, "div"),
            'a');

        /* version */

        child_node(f => f.innerText = project.version,
            child_node(d => d.classList.add(CLASS.VERSION), entry, "div"),
            "font");

        /* description */

        child_node(i => i.innerText = project.description,
            child_node(d => d.classList.add(CLASS.DESCRIPTION), entry, "div"),
            'i');
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
            console.log(div.innerHTML);
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
        return document.location.pathname.includes("index")
                || '/'.includes(document.location.pathname)
            ? CLASS.INDEX : CLASS.PROJECT;
    };
    /* infer the project title based on the URL */
    let infer_project_title = function() {
        let title = document.location.pathname;

        if (title.includes('/')) {
            title = title.split('/').pop();
        }

        if (!title.includes('.')) {
            return title;
        }
        title = title.split('.');
        title.pop();
        return title.join('.');
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
        let text = await (await response_for(
            project_documentation_link(title))).text();
        console.log(project_documentation_link(title));
        console.log(await response_for(project_documentation_link(title)));
        return text;
    };
    /* return the documentation link for a project with a given title */
    let project_documentation_link = function(title) {
        return `${SHARE.DOCS_DIR}/${title}.html`;
    };
    /* return the link for a project with a given title */
    let project_link = function(title) {
        return `/${title}.html`;
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

