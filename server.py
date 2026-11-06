import argparse
import json
import logging
import mimetypes
import re
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Iterator
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parent
DATABASE_PATH = ROOT / "bug_tracker.sqlite3"
VALID_SEVERITIES = {"Critical", "High", "Medium", "Low"}
VALID_STATUSES = {"New", "In Progress", "Escalated", "Resolved"}
MAX_REQUEST_SIZE = 1_000_000

mimetypes.add_type("text/javascript", ".jsx")


def connect_database(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS bugs (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            component TEXT NOT NULL,
            severity TEXT NOT NULL,
            status TEXT NOT NULL,
            assignee TEXT NOT NULL,
            reportedBy TEXT NOT NULL,
            createdAt TEXT NOT NULL,
            description TEXT NOT NULL,
            logs TEXT NOT NULL,
            aiAnalysis TEXT
        )
        """
    )
    return connection


@contextmanager
def database(path: Path) -> Iterator[sqlite3.Connection]:
    connection = connect_database(path)
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def bug_from_row(row: sqlite3.Row) -> dict[str, Any]:
    bug = dict(row)
    bug["aiAnalysis"] = json.loads(bug["aiAnalysis"]) if bug["aiAnalysis"] else None
    return bug


def validate_bug(bug: Any) -> dict[str, Any]:
    if not isinstance(bug, dict):
        raise ValueError("Each bug must be a JSON object.")

    required_fields = ("title", "component", "severity", "description")
    for field in required_fields:
        if not isinstance(bug.get(field), str) or not bug[field].strip():
            raise ValueError(f"{field} must be a non-empty string.")

    if bug["severity"] not in VALID_SEVERITIES:
        raise ValueError("severity must be Critical, High, Medium, or Low.")

    logs = bug.get("logs", "No stack trace provided by reporter.")
    if not isinstance(logs, str):
        raise ValueError("logs must be a string.")

    return {
        "title": bug["title"].strip()[:300],
        "component": bug["component"].strip()[:120],
        "severity": bug["severity"],
        "description": bug["description"].strip()[:10_000],
        "logs": logs[:50_000],
    }


def insert_bug(connection: sqlite3.Connection, bug: dict[str, Any]) -> None:
    connection.execute(
        """
        INSERT INTO bugs (
            id, title, component, severity, status, assignee,
            reportedBy, createdAt, description, logs, aiAnalysis
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            bug["id"],
            bug["title"],
            bug["component"],
            bug["severity"],
            bug["status"],
            bug["assignee"],
            bug["reportedBy"],
            bug["createdAt"],
            bug["description"],
            bug["logs"],
            json.dumps(bug.get("aiAnalysis"), ensure_ascii=False)
            if bug.get("aiAnalysis") is not None
            else None,
        ),
    )


class BugTrackerHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args: Any, directory: str | None = None, **kwargs: Any):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    @property
    def database_path(self) -> Path:
        return self.server.database_path  # type: ignore[attr-defined]

    def send_json(self, status: int, payload: Any) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json(self) -> Any:
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError as error:
            raise ValueError("Invalid Content-Length header.") from error
        if length <= 0 or length > MAX_REQUEST_SIZE:
            raise ValueError("Request body must be between 1 byte and 1 MB.")
        try:
            return json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError) as error:
            raise ValueError("Request body must contain valid JSON.") from error

    def do_GET(self) -> None:
        path = unquote(urlsplit(self.path).path)
        if path == "/api/health":
            self.send_json(200, {"status": "ok"})
            return
        if path == "/api/bugs":
            try:
                with database(self.database_path) as connection:
                    rows = connection.execute(
                        "SELECT * FROM bugs ORDER BY createdAt DESC, id DESC"
                    ).fetchall()
                self.send_json(200, [bug_from_row(row) for row in rows])
            except sqlite3.Error:
                logging.exception("Failed to load bugs")
                self.send_json(500, {"error": "Could not load bugs."})
            return
        if path.startswith("/api/"):
            self.send_json(404, {"error": "API endpoint not found."})
            return
        if path not in {"/", "/index.html", "/app.jsx", "/styles.css"}:
            self.send_json(404, {"error": "File not found."})
            return
        if path == "/":
            self.path = "/index.html"
        super().do_GET()

    def do_POST(self) -> None:
        path = unquote(urlsplit(self.path).path)
        try:
            payload = self.read_json()
            if path == "/api/bugs/initialize":
                self.initialize_bugs(payload)
            elif path == "/api/bugs":
                self.create_bug(payload)
            else:
                self.send_json(404, {"error": "API endpoint not found."})
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
        except sqlite3.Error:
            logging.exception("Failed to save bugs")
            self.send_json(500, {"error": "Could not save bug data."})

    def initialize_bugs(self, payload: Any) -> None:
        if not isinstance(payload, dict) or not isinstance(payload.get("bugs"), list):
            raise ValueError("bugs must be a list.")
        seeds = payload["bugs"]
        if len(seeds) > 500:
            raise ValueError("At most 500 sample bugs can be initialized.")

        with database(self.database_path) as connection:
            connection.execute("BEGIN IMMEDIATE")
            count = connection.execute("SELECT COUNT(*) FROM bugs").fetchone()[0]
            if count == 0:
                for seed in seeds:
                    if not isinstance(seed, dict):
                        raise ValueError("Each sample bug must be a JSON object.")
                    required = (
                        "id",
                        "title",
                        "component",
                        "severity",
                        "status",
                        "assignee",
                        "reportedBy",
                        "createdAt",
                        "description",
                        "logs",
                    )
                    if any(not isinstance(seed.get(key), str) for key in required):
                        raise ValueError("Sample bug data is missing required fields.")
                    if seed["severity"] not in VALID_SEVERITIES:
                        raise ValueError("Sample bug has an invalid severity.")
                    if seed["status"] not in VALID_STATUSES:
                        raise ValueError("Sample bug has an invalid status.")
                    insert_bug(connection, seed)
            rows = connection.execute(
                "SELECT * FROM bugs ORDER BY createdAt DESC, id DESC"
            ).fetchall()
        self.send_json(200, [bug_from_row(row) for row in rows])

    def create_bug(self, payload: Any) -> None:
        bug_data = validate_bug(payload)
        with database(self.database_path) as connection:
            connection.execute("BEGIN IMMEDIATE")
            rows = connection.execute("SELECT id FROM bugs").fetchall()
            highest_id = max(
                (
                    int(match.group(1))
                    for row in rows
                    if (match := re.fullmatch(r"BUG-(\d+)", row["id"]))
                ),
                default=100,
            )
            bug = {
                **bug_data,
                "id": f"BUG-{highest_id + 1}",
                "status": "New",
                "assignee": "Unassigned",
                "reportedBy": "Rockydark8 User",
                "createdAt": datetime.now().astimezone().strftime("%Y-%m-%d %H:%M"),
                "aiAnalysis": None,
            }
            insert_bug(connection, bug)
        self.send_json(201, bug)

    def do_PATCH(self) -> None:
        path = unquote(urlsplit(self.path).path)
        match = re.fullmatch(r"/api/bugs/(BUG-\d+)", path)
        if not match:
            self.send_json(404, {"error": "Bug not found."})
            return
        try:
            payload = self.read_json()
            if not isinstance(payload, dict) or not payload:
                raise ValueError("Request body must be a non-empty JSON object.")
            allowed = {"status", "assignee", "aiAnalysis"}
            if set(payload) - allowed:
                raise ValueError("Only status, assignee, and aiAnalysis can be updated.")
            if "status" in payload and (
                not isinstance(payload["status"], str)
                or payload["status"] not in VALID_STATUSES
            ):
                raise ValueError("Invalid bug status.")
            if "assignee" in payload and (
                not isinstance(payload["assignee"], str)
                or not payload["assignee"].strip()
            ):
                raise ValueError("assignee must be a non-empty string.")
            if "aiAnalysis" in payload and payload["aiAnalysis"] is not None and not isinstance(
                payload["aiAnalysis"], dict
            ):
                raise ValueError("aiAnalysis must be an object or null.")

            columns = {
                "status": "status",
                "assignee": "assignee",
                "aiAnalysis": "aiAnalysis",
            }
            assignments = ", ".join(
                f"{columns[key]} = ?" for key in payload
            )
            values = [
                json.dumps(value, ensure_ascii=False)
                if key == "aiAnalysis" and value is not None
                else value
                for key, value in payload.items()
            ]
            if "aiAnalysis" in payload and payload["aiAnalysis"] is None:
                values = [
                    None if key == "aiAnalysis" else value
                    for key, value in payload.items()
                ]
            values.append(match.group(1))

            with database(self.database_path) as connection:
                cursor = connection.execute(
                    f"UPDATE bugs SET {assignments} WHERE id = ?", values
                )
                if cursor.rowcount == 0:
                    self.send_json(404, {"error": "Bug not found."})
                    return
                row = connection.execute(
                    "SELECT * FROM bugs WHERE id = ?", (match.group(1),)
                ).fetchone()
            self.send_json(200, bug_from_row(row))
        except ValueError as error:
            self.send_json(400, {"error": str(error)})
        except sqlite3.Error:
            logging.exception("Failed to update bug")
            self.send_json(500, {"error": "Could not update bug."})


def create_server(
    host: str = "127.0.0.1",
    port: int = 8000,
    database_path: Path = DATABASE_PATH,
) -> ThreadingHTTPServer:
    with database(database_path):
        pass
    server = ThreadingHTTPServer(
        (host, port),
        lambda *args, **kwargs: BugTrackerHandler(*args, **kwargs),
    )
    server.database_path = database_path  # type: ignore[attr-defined]
    return server


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the Rockydark8 bug tracker.")
    parser.add_argument("--host", default="127.0.0.1", help="Interface to bind to.")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on.")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(message)s")

    server = create_server(args.host, args.port)
    print(f"Bug tracker running at http://{args.host}:{args.port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping bug tracker.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
