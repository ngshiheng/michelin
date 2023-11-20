import { create, insertMultiple, search } from "@orama/orama";

let restaurantDB: any;
const summary = document.getElementById("search-summary");
const table = document.getElementById("search-results");

async function createLyraInstance(event: Event) {
    const endpoint = "data.json";
    const response = await fetch(endpoint);
    const data = await response.json();

    restaurantDB = await create({
        schema: {
            Name: "string",
            Address: "string",
            Location: "string",
            Price: "string",
            Cuisine: "string",
            Longitude: "string",
            Latitude: "string",
            PhoneNumber: "string",
            Url: "string",
            WebsiteUrl: "string",
            Award: "string",
            FacilitiesAndServices: "string",
            Description: "string",
        },
    });
    insertMultiple(restaurantDB, data, 100);
}

function jsonToHtmlTable(json: any) {
    const table = document.getElementById("search-results");
    // Clear existing table
    if (table) table.innerHTML = "";
    if (!json[0]) return;

    // Create table header
    const ignoreList = [
        "Longitude",
        "Latitude",
        "Url",
        "WebsiteUrl",
        "PhoneNumber",
        "FacilitiesAndServices",
        "Description",
    ];

    const thead = (<HTMLTableElement>table).createTHead();
    let row = thead.insertRow();
    let columns = Object.keys(json[0].document);
    for (let key of columns) {
        // Skip keys that should be ignored
        if (ignoreList.includes(key)) continue;

        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }

    // Create table body
    const tbody = (<HTMLTableElement>table).createTBody();
    for (let element of json) {
        row = tbody.insertRow();
        for (let key of columns) {
            // Skip keys that should be ignored
            if (ignoreList.includes(key)) continue;

            let cell = row.insertCell();

            // Add relevant attribute based on key.
            // E.g. if the key is "Name", create a link element and set its href attribute
            switch (key) {
                case "Name": {
                    const websiteUrl = element.document["WebsiteUrl"];
                    if (!websiteUrl) {
                        const text = document.createTextNode(
                            element.document[key],
                        );
                        cell.appendChild(text);
                        break;
                    }
                    const link = document.createElement("a");
                    link.setAttribute("href", websiteUrl);
                    link.innerText = element.document[key];
                    cell.appendChild(link);
                    break;
                }
                case "Address": {
                    const address = element.document["Address"];
                    if (address) {
                        const link = document.createElement("a");
                        link.setAttribute(
                            "href",
                            `https://maps.google.com/?q=${address}`,
                        );
                        link.setAttribute("target", "_blank");
                        link.innerText = address;
                        cell.appendChild(link);
                    }
                    break;
                }
                case "PhoneNumber": {
                    const phoneNumber = element.document["PhoneNumber"];
                    if (phoneNumber) {
                        let text = document.createTextNode(
                            element.document[key],
                        );
                        cell.appendChild(text);
                    }
                    break;
                }
                case "Award": {
                    const link = document.createElement("a");
                    const url = element.document["Url"];
                    link.setAttribute("href", url);
                    link.innerText = element.document[key];
                    cell.appendChild(link);
                    break;
                }
                default: {
                    const text = document.createTextNode(element.document[key]);
                    cell.appendChild(text);
                    break;
                }
            }
        }
    }
}

async function handleSearch(event: Event) {
    const searchTermElement = document.getElementById("search-term");
    const searchTerm = (<HTMLInputElement>searchTermElement).value;

    if (!searchTerm || !restaurantDB) {
        if (summary) summary.innerText = "";
        if (table) table.innerHTML = "";
        return;
    }

    const searchResult = await search(restaurantDB, {
        term: searchTerm,
        properties: ["Name", "Address", "Location", "Cuisine"],
        tolerance: 3,
        limit: 20,
    });

    if (summary) {
        summary.innerText = `Found ${searchResult.count} results. Search took ${searchResult.elapsed.formatted}.`;
    }

    jsonToHtmlTable(searchResult.hits);
}

window.onload = async function (event: Event) {
    createLyraInstance(event);
    handleSearch(event);
};

document.body.addEventListener("input", handleSearch);
