export default class Http {
  constructor() {
    this.app = document.getElementById("app");
    this.baseURL = "https://dev-wp-json.pantheonsite.io/wp-json/wp/v2";
    this.request = {};
    this.endpoints = [];
    this.request = {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json; charset=utf-8"
      })
    };

    this.endpoints = [
      fetch(`${this.baseURL}/posts`, this.request),
      fetch(`${this.baseURL}/categories`, this.request)
    ];
  }

  displayResults(posts, categories, isParallel = false) {
    this.app.innerHTML += `
    <h2>Display Posts In ${isParallel ? "Parallel" : "Serial"} </h2>
    <ul>
      ${posts.map((post) => `<li>${post.title.rendered}</li>`).join("")}
    </ul>

    <h2>Display Categories In ${isParallel ? "Parallel" : "Serial"} </h2>
    <ul>
      ${categories.map((cat) => `<li>${cat.name}</li>`).join("")}
    </ul>
  `;
  }

  getDataInParallel() {
    try {
      Promise.all(this.endpoints).then(async (response) => {
        const results = response.map((result) => result.clone().json());
        const [allPosts, allCategories] = await Promise.all(results);

        console.log("PARALLEL Posts: ", allPosts);
        console.log("PARALLEL Categories: ", allCategories);

        console.log(results);
        this.displayResults(allPosts, allCategories, true);
      });
    } catch (error) {
      console.error(error);
    }
  }

  getDataInSerial() {
    return this.endpoints
      .reduce((results, currentEndpoint) => {
        return results.then((response) => {
          return currentEndpoint
            .then((currentResult) => currentResult.clone().json())
            .then((jsonResult) => [...response, jsonResult]);
        });
      }, Promise.resolve([]))
      .then(([allPosts, allCategories]) => {
        console.log("SERIAL Posts: ", allPosts);
        console.log("SERIAL Categories: ", allCategories);

        this.displayResults(allPosts, allCategories);
      });
  }
}
