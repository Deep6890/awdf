# Richardson Maturity Model Evaluation
**Project:** Task Management API (Practical 4)  
**Evaluator:** 24AIML018

## 1. API Evaluation Table

| Level | Criterion | Does our API satisfy this? | Evidence |
| :--- | :--- | :--- | :--- |
| **Level 0** | Uses HTTP as a transport system. Usually a single URI (e.g. `/api`) and one HTTP method (e.g. `POST`). | **Yes** (Exceeds) | The API runs over HTTP (Node.js/Express `app.listen()`), though it exceeds this level by using multiple URIs and methods. |
| **Level 1** | Introduces Resources. The API exposes multiple URIs, each mapping to a specific resource (e.g., `/tasks`, `/tasks/:id`). | **Yes** | We have distinct route paths: `/tasks` (collection resource), `/tasks/stats` (sub-resource), and `/tasks/:id` (individual resource). |
| **Level 2** | Introduces HTTP Verbs & Status Codes. Uses standard methods (GET, POST, PUT, DELETE) and meaningful HTTP status codes (200, 201, 404). | **Yes** | The API strictly uses `app.get()`, `app.post()`, `app.put()`, and `app.delete()`. It returns `201 Created` for new tasks, `404 Not Found` for invalid IDs, and `400 Bad Request` via middleware. |
| **Level 3** | HATEOAS (Hypermedia Controls). Responses include links to related resources or available actions to guide the client. | **No** | Our current API returns raw JSON data (e.g., `{ id: 1, title: '...' }`) without any hypermedia `_links` object guiding the client on what to do next. |

### Conclusion
**Our current Task Management API perfectly satisfies Level 2 of the Richardson Maturity Model.** No violations of Level 2 were found (the initial implementation in Practical 4 was built strictly according to REST best practices, utilizing the correct verbs and status codes). Therefore, no structural corrections to the route files (`server.js`) were necessary, though the original file has been included in this repository for reference.

---

## 2. HATEOAS Awareness (Level 3)

If we were to upgrade this API to **Level 3**, we would need to implement Hypermedia As The Engine Of Application State (HATEOAS). This means injecting navigation links into our API responses.

If a client makes a `GET /tasks/123` request, the modified Level 3 response would look like this:

```json
{
  "id": 123,
  "title": "Learn Node.js",
  "description": "Study Express and middleware",
  "completed": false,
  "_links": {
    "self": {
      "href": "/tasks/123",
      "method": "GET"
    },
    "update": {
      "href": "/tasks/123",
      "method": "PUT"
    },
    "delete": {
      "href": "/tasks/123",
      "method": "DELETE"
    },
    "mark-complete": {
      "href": "/tasks/123/complete",
      "method": "PATCH"
    }
  }
}
```
*The `_links` object provides the client with exactly what actions are currently valid for this specific task, acting as an interactive map.*

---

## 3. Why Production APIs Often Stop at Level 2

While Level 3 (HATEOAS) represents the "glory of REST," the vast majority of real-world production APIs stop at Level 2. This happens for several reasons:

1. **Client Complexity:** Consuming a Level 3 API requires the client to dynamically parse and follow links rather than hardcoding endpoints. Most frontend frameworks (like React or Vue) rely on structured API clients (like Axios or OpenAPI generators) that expect predictable, static endpoints. Building a truly dynamic HATEOAS client adds significant overhead.
2. **Payload Bloat:** Injecting `_links` into every single resource and collection response significantly increases the JSON payload size, leading to higher bandwidth usage and slower parsing times.
3. **Diminishing Returns:** Level 2 provides 95% of the benefits of REST (caching, statelessness, predictable verbs, and standardized error handling). For most internal or SPA-driven applications, the extra 5% gained by discovering URIs dynamically is not worth the architectural cost. Level 3 is primarily useful for highly public APIs where the backend wants the freedom to change URI structures at will without breaking client applications. 
