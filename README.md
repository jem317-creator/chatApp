# QR Redirect Server

A small Python project for creating QR codes that point to short local redirect links. Instead of putting the final destination URL directly into the QR code, this project creates a short ID, stores the destination in a JSON file, and serves redirects from a lightweight HTTP server.

For example, a QR code may point to:

```text
http://192.168.1.25:8000/aB3xY9z
```

When someone scans the QR code, the server looks up `aB3xY9z` in `QR_links.json` and redirects the user to the original saved URL.

## Features

- Generate QR code PNG files from user-provided links
- Automatically normalize links by adding `https://` when needed
- Create random 7-character redirect IDs
- Store redirect mappings in `QR_links.json`
- Reuse the same saved domain after the first setup
- Run a local HTTP redirect server on port `8000`
- Start, stop, or run the server visibly with a shell script
- Support local hosting or public-IP/port-forwarded hosting

## Project Files

| File | Purpose |
|---|---|
| `QR_manager.py` | Creates new redirect links, saves them to `QR_links.json`, and generates QR code PNG files. |
| `QR_server.py` | Runs the HTTP server that receives QR scan requests and redirects users to the saved destination URL. |
| `QR_server.sh` | Helper script for starting and stopping the server. |
| `QR_links.json` | Generated automatically. Stores the saved domain and QR redirect mappings. |
| `my_qr_<name>.png` | Generated QR code image files. |
| `server.log` | Generated when the server is run in the background. Stores server output. |

## Requirements

- Python 3
- `qrcode` Python package

Install the required package with:

```bash
pip install qrcode
```

Depending on your system, you may need to use:

```bash
pip3 install qrcode
```

## How It Works

1. Run `QR_manager.py`.
2. Enter the destination URL you want the QR code to open.
3. The program generates a random redirect ID.
4. The destination URL is saved in `QR_links.json` under that ID.
5. The program creates a QR code PNG that points to your server and the redirect ID.
6. Run `QR_server.py`.
7. When the QR code is scanned, the server redirects the scanner to the saved URL.

## Setup

Clone or download the project, then move into the project folder:

```bash
cd your-project-folder
```

Install the QR code dependency:

```bash
pip install qrcode
```

Make the shell script executable:

```bash
chmod +x QR_server.sh
```

## Creating a QR Code

Run:

```bash
python QR_manager.py
```

The program will ask for the domain to your hosting site the first time you run it.

### Local hosting

If you are hosting on your local network, leave the domain field blank and press Enter. The program will automatically use your computer's local IP address.

### Port-forwarded hosting

If you are using port forwarding, enter:

```text
port
```

The program will attempt to find your public IP address and use that as the QR code domain.

### Custom domain

You can also enter a custom domain manually, such as:

```text
example.com
```

After the domain is set, the program asks for the link you want the QR code to open. Then it asks for a name for the QR code file.

The output file will be named like this:

```text
my_qr_<name>.png
```

For example, if you enter:

```text
caseWestern
```

The generated file will be:

```text
my_qr_caseWestern.png
```

## Running the Server

The server listens on port `8000`.

### Run in the foreground

Use this when testing, because server output is printed directly in the terminal:

```bash
./QR_server.sh -v
```

You can also run the Python file directly:

```bash
python QR_server.py
```

### Run in the background

Use this when you want the server to keep running without occupying the terminal:

```bash
./QR_server.sh -r
```

Output will be written to:

```text
server.log
```

### Stop the server

```bash
./QR_server.sh -s
```

## Example Workflow

Start by creating a QR code:

```bash
python QR_manager.py
```

Example prompts:

```text
Enter the domain to your hosting site.
If you are hosting locally, leave the entry blank and hit enter.
If you are using port forwarding enter 'port' and the program will find your public IP and use that:

Enter the link for your QR code: case.edu
enter a name for Your QR code file: caseWestern
```

This creates:

```text
my_qr_caseWestern.png
```

Then start the server:

```bash
./QR_server.sh -v
```

When someone scans the QR code, their browser requests the short redirect URL. The server reads `QR_links.json`, finds the matching ID, and sends the user to the saved destination link.

## JSON Storage Format

The project creates and updates a file called `QR_links.json`.

It will look similar to this:

```json
{
    "domain": "192.168.1.25",
    "aB3xY9z": "https://case.edu",
    "Q8mN2pL": "https://housing.case.edu"
}
```

The `domain` value stores the server address used for generated QR links. Each random ID stores one destination URL.

## Notes

- The QR code will only work while `QR_server.py` is running.
- If hosting locally, users must be on the same network as the server.
- If using a public IP, your router/firewall must forward port `8000` to the machine running the server.
- The server must have access to the same `QR_links.json` file that was created by `QR_manager.py`.
- If you move the project folder, keep the generated JSON file with the Python files.

## Troubleshooting

### `ModuleNotFoundError: No module named 'qrcode'`

Install the dependency:

```bash
pip install qrcode
```

### QR code opens a 404 page

This usually means the redirect ID is not in `QR_links.json`, the server is running from the wrong folder, or the QR code was generated using a different copy of the JSON file.

### QR code does not load at all

Check that:

- The server is running
- The device scanning the QR code can reach the server IP/domain
- Port `8000` is open
- You are on the same local network if using local hosting

### Server says the port is already in use

Stop the old server process:

```bash
./QR_server.sh -s
```

Then restart it:

```bash
./QR_server.sh -v
```

## Possible Future Improvements

- Add a web interface for creating and managing QR codes
- Add custom short-link names instead of random IDs
- Add edit/delete support for saved QR links
- Add better error handling when `QR_links.json` is missing or invalid
- Add HTTPS support for public deployments
- Add a requirements file for easier installation

