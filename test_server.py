import json
import tempfile
import threading
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from server import create_server


class BugTrackerApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.server = create_server(
            port=0,
            database_path=Path(self.temp_dir.name) / "test.sqlite3",
        )
        self.thread = threading.Thread(target=self.server.serve_forever)
        self.thread.start()
        self.base_url = f"http://127.0.0.1:{self.server.server_port}"
        self.seed = {
            "id": "BUG-101",
            "title": "Sample issue",
            "component": "Test",
            "severity": "High",
            "status": "New",
            "assignee": "Unassigned",
            "reportedBy": "Test",
            "createdAt": "2026-01-01 10:00",
            "description": "A test issue",
            "logs": "",
            "aiAnalysis": None,
        }

    def tearDown(self) -> None:
        self.server.shutdown()
        self.thread.join()
        self.server.server_close()
        self.temp_dir.cleanup()

    def request_json(self, path: str, method: str = "GET", data=None):
        body = json.dumps(data).encode("utf-8") if data is not None else None
        request = Request(
            self.base_url + path,
            data=body,
            method=method,
            headers={"Content-Type": "application/json"},
        )
        with urlopen(request) as response:
            return response.status, json.loads(response.read())

    def test_initialization_and_updates_persist(self) -> None:
        status, initialized = self.request_json(
            "/api/bugs/initialize", "POST", {"bugs": [self.seed]}
        )
        self.assertEqual(status, 200)
        self.assertEqual(initialized[0]["id"], "BUG-101")

        status, updated = self.request_json(
            "/api/bugs/BUG-101",
            "PATCH",
            {"status": "In Progress", "aiAnalysis": {"confidence": 96}},
        )
        self.assertEqual(status, 200)
        self.assertEqual(updated["status"], "In Progress")

        _, bugs = self.request_json("/api/bugs")
        self.assertEqual(bugs[0]["aiAnalysis"], {"confidence": 96})
        self.assertEqual(bugs[0]["status"], "In Progress")

    def test_create_assigns_next_id_and_rejects_invalid_input(self) -> None:
        self.request_json("/api/bugs/initialize", "POST", {"bugs": [self.seed]})
        status, created = self.request_json(
            "/api/bugs",
            "POST",
            {
                "title": "New issue",
                "component": "Test",
                "severity": "Medium",
                "description": "Created through the API",
            },
        )
        self.assertEqual(status, 201)
        self.assertEqual(created["id"], "BUG-102")

        request = Request(
            self.base_url + "/api/bugs",
            data=json.dumps({"title": "", "severity": "Unknown"}).encode("utf-8"),
            method="POST",
            headers={"Content-Type": "application/json"},
        )
        with self.assertRaises(HTTPError) as error:
            urlopen(request)
        self.assertEqual(error.exception.code, 400)

    def test_patch_rejects_invalid_status_type(self) -> None:
        self.request_json("/api/bugs/initialize", "POST", {"bugs": [self.seed]})
        request = Request(
            self.base_url + "/api/bugs/BUG-101",
            data=json.dumps({"status": []}).encode("utf-8"),
            method="PATCH",
            headers={"Content-Type": "application/json"},
        )
        with self.assertRaises(HTTPError) as error:
            urlopen(request)
        self.assertEqual(error.exception.code, 400)

    def test_concurrent_creates_receive_unique_ids(self) -> None:
        self.request_json("/api/bugs/initialize", "POST", {"bugs": [self.seed]})
        payload = {
            "title": "Concurrent issue",
            "component": "Test",
            "severity": "Low",
            "description": "Created concurrently",
        }
        with ThreadPoolExecutor(max_workers=2) as executor:
            results = list(
                executor.map(
                    lambda _: self.request_json("/api/bugs", "POST", payload)[1]["id"],
                    range(2),
                )
            )
        self.assertEqual(set(results), {"BUG-102", "BUG-103"})

    def test_jsx_is_served_as_javascript(self) -> None:
        with urlopen(self.base_url + "/app.jsx") as response:
            self.assertEqual(response.headers.get_content_type(), "text/javascript")


if __name__ == "__main__":
    unittest.main()
